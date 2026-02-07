/**
 * Settings interface for Obsidian Vault Linter
 */
export interface VaultLinterSettings {
	// Frontmatter settings
	enforceFrontmatter: boolean;
	frontmatterTemplate: string;
	
	// Formatting settings
	normalizeFormatting: boolean;
	endWithNewline: boolean;
	removeMultipleBlankLines: boolean;
	
	// Tag settings
	enforceTagRules: boolean;
	tagFormat: 'lowercase' | 'uppercase' | 'camelCase' | 'none';
	
	// Wikilink settings
	safeWikilinkInsertion: boolean;
	wikilinkStyle: 'shortest' | 'relative' | 'absolute';
}

export const DEFAULT_SETTINGS: VaultLinterSettings = {
	enforceFrontmatter: true,
	frontmatterTemplate: '---\ntitle: {{title}}\ndate: {{date}}\ntags: []\n---',
	normalizeFormatting: true,
	endWithNewline: true,
	removeMultipleBlankLines: true,
	enforceTagRules: false,
	tagFormat: 'lowercase',
	safeWikilinkInsertion: true,
	wikilinkStyle: 'shortest'
};
