import { VaultLinterSettings } from './settings';

/**
 * Wikilink insertion module
 * Ensures safe and consistent wikilink formatting
 */
export class WikilinkInserter {
	settings: VaultLinterSettings;

	constructor(settings: VaultLinterSettings) {
		this.settings = settings;
	}

	/**
	 * Extract all wikilinks from content
	 */
	extractWikilinks(content: string): string[] {
		const wikilinks: string[] = [];
		const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
		let match;
		
		while ((match = wikilinkRegex.exec(content)) !== null) {
			wikilinks.push(match[1]);
		}

		return wikilinks;
	}

	/**
	 * Normalize wikilink path based on settings
	 */
	normalizeWikilinkPath(path: string): string {
		if (!this.settings.safeWikilinkInsertion) {
			return path;
		}

		// Handle alias format: [[path|alias]]
		const parts = path.split('|');
		let linkPath = parts[0].trim();
		const alias = parts.length > 1 ? parts[1].trim() : null;

		// Apply path style normalization
		switch (this.settings.wikilinkStyle) {
			case 'shortest':
				// Remove path components, keep only filename
				linkPath = linkPath.split('/').pop() || linkPath;
				// Remove extension if present
				linkPath = linkPath.replace(/\.md$/, '');
				break;
			case 'relative':
				// Keep as-is for now (would need vault context to compute relative paths)
				break;
			case 'absolute':
				// Keep as-is for now (would need vault context to compute absolute paths)
				break;
		}

		// Reconstruct with alias if present
		return alias ? `${linkPath}|${alias}` : linkPath;
	}

	/**
	 * Validate and normalize wikilinks in content
	 */
	normalize(content: string): string {
		if (!this.settings.safeWikilinkInsertion) {
			return content;
		}

		// Replace wikilinks with normalized versions
		return content.replace(/\[\[([^\]]+)\]\]/g, (match, path) => {
			const normalized = this.normalizeWikilinkPath(path);
			return `[[${normalized}]]`;
		});
	}
}
