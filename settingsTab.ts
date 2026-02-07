import { App, PluginSettingTab, Setting } from 'obsidian';
import VaultLinterPlugin from './main';

export class VaultLinterSettingTab extends PluginSettingTab {
	plugin: VaultLinterPlugin;

	constructor(app: App, plugin: VaultLinterPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Obsidian Vault Linter Settings' });

		// Frontmatter section
		containerEl.createEl('h3', { text: 'Frontmatter' });

		new Setting(containerEl)
			.setName('Enforce frontmatter')
			.setDesc('Ensure all notes have valid frontmatter')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enforceFrontmatter)
				.onChange(async (value) => {
					this.plugin.settings.enforceFrontmatter = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Frontmatter template')
			.setDesc('Template for auto-generated frontmatter (use {{title}}, {{date}})')
			.addTextArea(text => text
				.setPlaceholder('---\ntitle: {{title}}\ndate: {{date}}\n---')
				.setValue(this.plugin.settings.frontmatterTemplate)
				.onChange(async (value) => {
					this.plugin.settings.frontmatterTemplate = value;
					await this.plugin.saveSettings();
				}));

		// Formatting section
		containerEl.createEl('h3', { text: 'Formatting' });

		new Setting(containerEl)
			.setName('Normalize formatting')
			.setDesc('Apply consistent formatting rules to notes')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.normalizeFormatting)
				.onChange(async (value) => {
					this.plugin.settings.normalizeFormatting = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('End files with newline')
			.setDesc('Ensure all files end with a single newline')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.endWithNewline)
				.onChange(async (value) => {
					this.plugin.settings.endWithNewline = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Remove multiple blank lines')
			.setDesc('Replace multiple consecutive blank lines with single blank line')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.removeMultipleBlankLines)
				.onChange(async (value) => {
					this.plugin.settings.removeMultipleBlankLines = value;
					await this.plugin.saveSettings();
				}));

		// Tag section
		containerEl.createEl('h3', { text: 'Tags' });

		new Setting(containerEl)
			.setName('Enforce tag rules')
			.setDesc('Apply normalization rules to tags')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enforceTagRules)
				.onChange(async (value) => {
					this.plugin.settings.enforceTagRules = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Tag format')
			.setDesc('Preferred format for tags')
			.addDropdown(dropdown => dropdown
				.addOption('lowercase', 'lowercase')
				.addOption('uppercase', 'UPPERCASE')
				.addOption('camelCase', 'camelCase')
				.addOption('none', 'No normalization')
				.setValue(this.plugin.settings.tagFormat)
				.onChange(async (value: any) => {
					this.plugin.settings.tagFormat = value;
					await this.plugin.saveSettings();
				}));

		// Wikilink section
		containerEl.createEl('h3', { text: 'Wikilinks' });

		new Setting(containerEl)
			.setName('Safe wikilink insertion')
			.setDesc('Validate and normalize wikilinks during insertion')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.safeWikilinkInsertion)
				.onChange(async (value) => {
					this.plugin.settings.safeWikilinkInsertion = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Wikilink style')
			.setDesc('Preferred style for wikilinks')
			.addDropdown(dropdown => dropdown
				.addOption('shortest', 'Shortest path')
				.addOption('relative', 'Relative path')
				.addOption('absolute', 'Absolute path')
				.setValue(this.plugin.settings.wikilinkStyle)
				.onChange(async (value: any) => {
					this.plugin.settings.wikilinkStyle = value;
					await this.plugin.saveSettings();
				}));
	}
}
