import { VaultLinterSettings } from './settings';

/**
 * Tag rules module
 * Enforces consistent tag formatting
 */
export class TagRules {
	settings: VaultLinterSettings;

	constructor(settings: VaultLinterSettings) {
		this.settings = settings;
	}

	/**
	 * Extract all tags from content (both inline #tags and frontmatter tags)
	 */
	extractTags(content: string): string[] {
		const tags: string[] = [];

		// Extract inline tags
		const inlineTagRegex = /#([a-zA-Z0-9_\-\/]+)/g;
		let match;
		while ((match = inlineTagRegex.exec(content)) !== null) {
			tags.push(match[1]);
		}

		return tags;
	}

	/**
	 * Normalize tag format based on settings
	 */
	normalizeTag(tag: string): string {
		if (!this.settings.enforceTagRules) {
			return tag;
		}

		switch (this.settings.tagFormat) {
			case 'lowercase':
				return tag.toLowerCase();
			case 'uppercase':
				return tag.toUpperCase();
			case 'camelCase':
				// Convert to camelCase: split on non-alphanumeric, capitalize first letter of each word after first
				return tag
					.split(/[_\-\/]/)
					.map((word, index) => {
						if (index === 0) {
							return word.toLowerCase();
						}
						return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
					})
					.join('');
			case 'none':
			default:
				return tag;
		}
	}

	/**
	 * Apply tag rules to content
	 */
	enforce(content: string): string {
		if (!this.settings.enforceTagRules) {
			return content;
		}

		// Replace inline tags with normalized versions
		return content.replace(/#([a-zA-Z0-9_\-\/]+)/g, (match, tag) => {
			return '#' + this.normalizeTag(tag);
		});
	}
}
