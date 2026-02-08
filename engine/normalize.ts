import { VaultLinterSettings } from '../settings';
import { FrontmatterEnforcer } from './frontmatter';
import { FormattingNormalizer } from './format';
import { TagRules } from './tags';
import { WikilinkInserter } from './backlinks';

/**
 * Normalization orchestrator
 * Coordinates the linting pipeline: frontmatter → formatting → tags → wikilinks
 */
export class NormalizationPipeline {
	private frontmatterEnforcer: FrontmatterEnforcer;
	private formattingNormalizer: FormattingNormalizer;
	private tagRules: TagRules;
	private wikilinkInserter: WikilinkInserter;

	constructor(settings: VaultLinterSettings) {
		this.frontmatterEnforcer = new FrontmatterEnforcer(settings);
		this.formattingNormalizer = new FormattingNormalizer(settings);
		this.tagRules = new TagRules(settings);
		this.wikilinkInserter = new WikilinkInserter(settings);
	}

	/**
	 * Apply all linting rules to content in a deterministic order
	 * Pipeline: frontmatter → formatting → tags → wikilinks
	 * Each transformation is idempotent and produces minimal diffs
	 */
	normalize(content: string, fileName: string): string {
		let normalized = content;

		// Step 1: Enforce frontmatter
		normalized = this.frontmatterEnforcer.enforce(normalized, fileName);

		// Step 2: Normalize formatting
		normalized = this.formattingNormalizer.normalize(normalized);

		// Step 3: Enforce tag rules
		normalized = this.tagRules.enforce(normalized);

		// Step 4: Normalize wikilinks (safe backlink insertion)
		normalized = this.wikilinkInserter.normalize(normalized);

		return normalized;
	}

	/**
	 * Update settings and reinitialize all modules
	 */
	updateSettings(settings: VaultLinterSettings): void {
		this.frontmatterEnforcer = new FrontmatterEnforcer(settings);
		this.formattingNormalizer = new FormattingNormalizer(settings);
		this.tagRules = new TagRules(settings);
		this.wikilinkInserter = new WikilinkInserter(settings);
	}
}
