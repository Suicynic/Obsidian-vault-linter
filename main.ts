import { App, Editor, MarkdownView, Notice, Plugin, TFile, TFolder } from 'obsidian';
import { VaultLinterSettings, DEFAULT_SETTINGS } from './settings';
import { VaultLinterSettingTab } from './settingsTab';
import { NormalizationPipeline } from './engine/normalize';
import { generateChangeReport, formatReportAsMarkdown, formatVaultReportAsMarkdown, ChangeReport } from './engine/report';

export default class VaultLinterPlugin extends Plugin {
	settings: VaultLinterSettings;
	pipeline: NormalizationPipeline;

	async onload() {
		await this.loadSettings();

		// Initialize normalization pipeline
		this.pipeline = new NormalizationPipeline(this.settings);

		// Add settings tab
		this.addSettingTab(new VaultLinterSettingTab(this.app, this));

		// Command: Normalize current file
		this.addCommand({
			id: 'normalize-current-file',
			name: 'Normalize: Current file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.normalizeCurrentFile(editor, view);
			}
		});

		// Command: Normalize folder
		this.addCommand({
			id: 'normalize-folder',
			name: 'Normalize: Folder',
			callback: async () => {
				await this.normalizeFolder();
			}
		});

		// Command: Normalize entire vault
		this.addCommand({
			id: 'normalize-entire-vault',
			name: 'Normalize: Entire vault',
			callback: async () => {
				await this.normalizeAllFiles();
			}
		});

		// Command: Dry run current file
		this.addCommand({
			id: 'dry-run-current-file',
			name: 'Dry run: Current file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.dryRunCurrentFile(editor, view);
			}
		});

		// Command: Dry run entire vault
		this.addCommand({
			id: 'dry-run-entire-vault',
			name: 'Dry run: Entire vault',
			callback: async () => {
				await this.dryRunEntireVault();
			}
		});

		console.log('Obsidian Vault Linter plugin loaded');
	}

	onunload() {
		console.log('Obsidian Vault Linter plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// Update pipeline with new settings
		this.pipeline.updateSettings(this.settings);
	}

	/**
	 * Apply all linting rules to content
	 */
	lintContent(content: string, fileName: string): string {
		return this.pipeline.normalize(content, fileName);
	}

	/**
	 * Normalize the current file
	 */
	async normalizeCurrentFile(editor: Editor, view: MarkdownView) {
		const file = view.file;
		if (!file) {
			new Notice('No active file');
			return;
		}

		const content = editor.getValue();
		const normalized = this.lintContent(content, file.name);

		if (content === normalized) {
			new Notice('✓ File already conforms to linting rules');
		} else {
			editor.setValue(normalized);
			new Notice('✓ File normalized successfully');
		}
	}

	/**
	 * Normalize a folder (prompt user to select)
	 */
	async normalizeFolder() {
		// Get current active file to determine folder
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a file in the folder you want to normalize');
			return;
		}

		const folder = activeFile.parent;
		if (!folder) {
			new Notice('Cannot determine folder');
			return;
		}

		const files = this.getMarkdownFilesInFolder(folder);
		
		if (files.length === 0) {
			new Notice('No markdown files found in this folder');
			return;
		}

		new Notice(`Starting folder normalization (${files.length} files in ${folder.path})...`);

		let normalizedCount = 0;
		let errorCount = 0;

		for (const file of files) {
			try {
				await this.normalizeFile(file);
				normalizedCount++;
			} catch (error) {
				console.error(`Error normalizing ${file.path}:`, error);
				errorCount++;
			}
		}

		if (errorCount > 0) {
			new Notice(`✓ Normalized ${normalizedCount} files (${errorCount} errors)`);
		} else {
			new Notice(`✓ Successfully normalized ${normalizedCount} files in ${folder.path}`);
		}
	}

	/**
	 * Get all markdown files in a folder (not recursive)
	 */
	getMarkdownFilesInFolder(folder: TFolder): TFile[] {
		const files: TFile[] = [];
		for (const child of folder.children) {
			if (child instanceof TFile && child.extension === 'md') {
				files.push(child);
			}
		}
		return files;
	}

	/**
	 * Dry run on current file without making changes
	 */
	async dryRunCurrentFile(editor: Editor, view: MarkdownView) {
		const file = view.file;
		if (!file) {
			new Notice('No active file');
			return;
		}

		const content = editor.getValue();
		const normalized = this.lintContent(content, file.name);

		if (content === normalized) {
			new Notice('✓ File conforms to linting rules');
		} else {
			new Notice('⚠ File has linting issues (use "Normalize: Current file" to fix)');
			
			// Generate and log report
			const report = generateChangeReport(file.path, file.name, content, normalized);
			const markdown = formatReportAsMarkdown(report);
			console.log(markdown);
		}
	}

	/**
	 * Dry run on entire vault and write report to /Reports
	 */
	async dryRunEntireVault() {
		const files = this.app.vault.getMarkdownFiles();
		new Notice(`Starting vault dry run (${files.length} files)...`);

		const reports: ChangeReport[] = [];

		for (const file of files) {
			try {
				const content = await this.app.vault.read(file);
				const normalized = this.lintContent(content, file.name);
				const report = generateChangeReport(file.path, file.name, content, normalized);
				reports.push(report);
			} catch (error) {
				console.error(`Error processing ${file.path}:`, error);
			}
		}

		// Generate report markdown
		const reportMarkdown = formatVaultReportAsMarkdown(reports);

		// Ensure Reports folder exists
		const reportsFolder = 'Reports';
		const existingReportsEntry = this.app.vault.getAbstractFileByPath(reportsFolder);
		if (!existingReportsEntry) {
			await this.app.vault.createFolder(reportsFolder);
		} else if (!(existingReportsEntry instanceof TFolder)) {
			new Notice(`Cannot save vault lint report: '${reportsFolder}' exists and is not a folder.`);
			console.error(`Vault Linter: '${reportsFolder}' exists and is not a folder. Cannot create reports directory.`);
			return;
		}

		// Write report
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const reportFileName = `${reportsFolder}/vault-lint-report-${timestamp}.md`;
		await this.app.vault.create(reportFileName, reportMarkdown);

		const changedFiles = reports.filter(r => r.changes.length > 0).length;
		new Notice(`✓ Dry run complete. Report saved to ${reportFileName}\n${changedFiles} files would be changed.`);
	}

	/**
	 * Normalize all markdown files in the vault
	 */
	async normalizeAllFiles() {
		const files = this.app.vault.getMarkdownFiles();
		let normalizedCount = 0;
		let errorCount = 0;

		new Notice(`Starting vault normalization (${files.length} files)...`);

		for (const file of files) {
			try {
				await this.normalizeFile(file);
				normalizedCount++;
			} catch (error) {
				console.error(`Error normalizing ${file.path}:`, error);
				errorCount++;
			}
		}

		if (errorCount > 0) {
			new Notice(`✓ Normalized ${normalizedCount} files (${errorCount} errors)`);
		} else {
			new Notice(`✓ Successfully normalized ${normalizedCount} files`);
		}
	}

	/**
	 * Normalize a specific file
	 */
	async normalizeFile(file: TFile) {
		const content = await this.app.vault.read(file);
		const normalized = this.lintContent(content, file.name);

		if (content !== normalized) {
			await this.app.vault.modify(file, normalized);
		}
	}
}
