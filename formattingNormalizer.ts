import { VaultLinterSettings } from './settings';

/**
 * Formatting normalization module
 * Applies consistent formatting rules to Markdown content
 */
export class FormattingNormalizer {
	settings: VaultLinterSettings;

	constructor(settings: VaultLinterSettings) {
		this.settings = settings;
	}

	/**
	 * Remove multiple consecutive blank lines
	 */
	removeMultipleBlankLines(content: string): string {
		if (!this.settings.removeMultipleBlankLines) {
			return content;
		}

		// Replace 3+ newlines with 2 newlines (keeping one blank line)
		return content.replace(/\n{3,}/g, '\n\n');
	}

	/**
	 * Ensure file ends with single newline
	 */
	ensureTrailingNewline(content: string): string {
		if (!this.settings.endWithNewline) {
			return content;
		}

		// Remove all trailing whitespace and newlines, then add single newline
		return content.replace(/\s+$/, '') + '\n';
	}

	/**
	 * Normalize line endings to LF
	 */
	normalizeLineEndings(content: string): string {
		return content.replace(/\r\n/g, '\n');
	}

	/**
	 * Apply all formatting normalizations
	 */
	normalize(content: string): string {
		if (!this.settings.normalizeFormatting) {
			return content;
		}

		let normalized = content;
		normalized = this.normalizeLineEndings(normalized);
		normalized = this.removeMultipleBlankLines(normalized);
		normalized = this.ensureTrailingNewline(normalized);

		return normalized;
	}
}
