import { App, Editor, MarkdownView, Notice, Plugin, TFile } from 'obsidian';
import { VaultLinterSettings, DEFAULT_SETTINGS } from './settings';
import { VaultLinterSettingTab } from './settingsTab';
import { FrontmatterEnforcer } from './frontmatterEnforcer';
import { FormattingNormalizer } from './formattingNormalizer';
import { TagRules } from './tagRules';
import { WikilinkInserter } from './wikilinkInserter';

export default class VaultLinterPlugin extends Plugin {
	settings: VaultLinterSettings;
	frontmatterEnforcer: FrontmatterEnforcer;
	formattingNormalizer: FormattingNormalizer;
	tagRules: TagRules;
	wikilinkInserter: WikilinkInserter;

	async onload() {
		await this.loadSettings();

		// Initialize linter modules
		this.frontmatterEnforcer = new FrontmatterEnforcer(this.settings);
		this.formattingNormalizer = new FormattingNormalizer(this.settings);
		this.tagRules = new TagRules(this.settings);
		this.wikilinkInserter = new WikilinkInserter(this.settings);

		// Add settings tab
		this.addSettingTab(new VaultLinterSettingTab(this.app, this));

		// Command: Lint current file
		this.addCommand({
			id: 'lint-current-file',
			name: 'Lint current file',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.lintCurrentFile(editor, view);
			}
		});

		// Command: Lint all files in vault
		this.addCommand({
			id: 'lint-all-files',
			name: 'Lint all files in vault',
			callback: () => {
				this.lintAllFiles();
			}
		});

		// Command: Check current file (dry run)
		this.addCommand({
			id: 'check-current-file',
			name: 'Check current file (dry run)',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.checkCurrentFile(editor, view);
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
		
		// Reinitialize modules with new settings
		this.frontmatterEnforcer = new FrontmatterEnforcer(this.settings);
		this.formattingNormalizer = new FormattingNormalizer(this.settings);
		this.tagRules = new TagRules(this.settings);
		this.wikilinkInserter = new WikilinkInserter(this.settings);
	}

	/**
	 * Apply all linting rules to content
	 */
	lintContent(content: string, fileName: string): string {
		let linted = content;

		// Apply linting modules in order
		linted = this.frontmatterEnforcer.enforce(linted, fileName);
		linted = this.formattingNormalizer.normalize(linted);
		linted = this.tagRules.enforce(linted);
		linted = this.wikilinkInserter.normalize(linted);

		return linted;
	}

	/**
	 * Lint the current file
	 */
	async lintCurrentFile(editor: Editor, view: MarkdownView) {
		const file = view.file;
		if (!file) {
			new Notice('No active file');
			return;
		}

		const content = editor.getValue();
		const linted = this.lintContent(content, file.name);

		if (content === linted) {
			new Notice('✓ File already conforms to linting rules');
		} else {
			editor.setValue(linted);
			new Notice('✓ File linted successfully');
		}
	}

	/**
	 * Check current file without making changes (dry run)
	 */
	async checkCurrentFile(editor: Editor, view: MarkdownView) {
		const file = view.file;
		if (!file) {
			new Notice('No active file');
			return;
		}

		const content = editor.getValue();
		const linted = this.lintContent(content, file.name);

		if (content === linted) {
			new Notice('✓ File conforms to linting rules');
		} else {
			new Notice('⚠ File has linting issues (use "Lint current file" to fix)');
		}
	}

	/**
	 * Lint all markdown files in the vault
	 */
	async lintAllFiles() {
		const files = this.app.vault.getMarkdownFiles();
		let lintedCount = 0;
		let errorCount = 0;

		new Notice(`Starting vault linting (${files.length} files)...`);

		for (const file of files) {
			try {
				await this.lintFile(file);
				lintedCount++;
			} catch (error) {
				console.error(`Error linting ${file.path}:`, error);
				errorCount++;
			}
		}

		if (errorCount > 0) {
			new Notice(`✓ Linted ${lintedCount} files (${errorCount} errors)`);
		} else {
			new Notice(`✓ Successfully linted ${lintedCount} files`);
		}
	}

	/**
	 * Lint a specific file
	 */
	async lintFile(file: TFile) {
		const content = await this.app.vault.read(file);
		const linted = this.lintContent(content, file.name);

		if (content !== linted) {
			await this.app.vault.modify(file, linted);
		}
	}
}
