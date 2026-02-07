import { VaultLinterSettings } from '../settings';

/**
 * Frontmatter enforcement module
 * Ensures all notes have valid YAML frontmatter with proper schema and ordering
 */
export class FrontmatterEnforcer {
	settings: VaultLinterSettings;

	constructor(settings: VaultLinterSettings) {
		this.settings = settings;
	}

	/**
	 * Check if content has valid frontmatter
	 */
	hasFrontmatter(content: string): boolean {
		return content.trimStart().startsWith('---');
	}

	/**
	 * Extract frontmatter from content
	 */
	extractFrontmatter(content: string): { frontmatter: string; body: string } | null {
		const trimmed = content.trimStart();
		if (!trimmed.startsWith('---')) {
			return null;
		}

		const afterFirst = trimmed.slice(3);
		const endIndex = afterFirst.indexOf('\n---');
		
		if (endIndex === -1) {
			return null;
		}

		const frontmatter = afterFirst.slice(0, endIndex);
		const body = afterFirst.slice(endIndex + 4);

		return { frontmatter, body };
	}

	/**
	 * Generate frontmatter from template with proper field ordering
	 * Schema: id, title, date, tags (in that order)
	 */
	generateFrontmatter(fileName: string): string {
		if (!this.settings.enforceFrontmatter) {
			return '';
		}

		const date = new Date().toISOString().split('T')[0];
		const title = fileName.replace(/\.md$/, '');
		const id = this.generateId(title);

		let frontmatter = this.settings.frontmatterTemplate;
		frontmatter = frontmatter.replace(/{{id}}/g, id);
		frontmatter = frontmatter.replace(/{{title}}/g, title);
		frontmatter = frontmatter.replace(/{{date}}/g, date);

		// Ensure proper formatting
		if (!frontmatter.startsWith('---')) {
			frontmatter = '---\n' + frontmatter;
		}
		if (!frontmatter.endsWith('---')) {
			frontmatter = frontmatter + '\n---';
		}

		return frontmatter;
	}

	/**
	 * Generate a deterministic ID from the title
	 */
	private generateId(title: string): string {
		// Convert to lowercase, replace spaces and special chars with hyphens
		return title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
	}

	/**
	 * Enforce frontmatter on content
	 */
	enforce(content: string, fileName: string): string {
		if (!this.settings.enforceFrontmatter) {
			return content;
		}

		if (this.hasFrontmatter(content)) {
			return content; // Already has frontmatter
		}

		const frontmatter = this.generateFrontmatter(fileName);
		return frontmatter + '\n\n' + content;
	}
}
