/**
 * Report generation for linting changes
 * Creates summaries of what was changed during normalization
 */

export interface ChangeReport {
	filePath: string;
	fileName: string;
	changes: Change[];
	originalContent: string;
	normalizedContent: string;
}

export interface Change {
	type: 'frontmatter-added' | 'frontmatter-normalized' | 'formatting-normalized' | 'tags-normalized' | 'wikilinks-normalized';
	description: string;
	lineNumber?: number;
}

/**
 * Generate a change report by comparing original and normalized content
 */
export function generateChangeReport(
	filePath: string,
	fileName: string,
	originalContent: string,
	normalizedContent: string
): ChangeReport {
	const changes: Change[] = [];
	
	// Check if content changed
	if (originalContent === normalizedContent) {
		return {
			filePath,
			fileName,
			changes: [],
			originalContent,
			normalizedContent
		};
	}
	
	// Detect frontmatter changes
	const originalHasFrontmatter = originalContent.trimStart().startsWith('---');
	const normalizedHasFrontmatter = normalizedContent.trimStart().startsWith('---');
	
	if (!originalHasFrontmatter && normalizedHasFrontmatter) {
		changes.push({
			type: 'frontmatter-added',
			description: 'Added frontmatter',
			lineNumber: 1
		});
	} else if (originalHasFrontmatter && normalizedHasFrontmatter) {
		const originalFrontmatter = extractFrontmatter(originalContent);
		const normalizedFrontmatter = extractFrontmatter(normalizedContent);
		if (originalFrontmatter !== normalizedFrontmatter) {
			changes.push({
				type: 'frontmatter-normalized',
				description: 'Normalized frontmatter',
				lineNumber: 1
			});
		}
	}
	
	// Detect formatting changes
	if (hasFormattingChanges(originalContent, normalizedContent)) {
		changes.push({
			type: 'formatting-normalized',
			description: 'Normalized formatting (line endings, blank lines, trailing newline)'
		});
	}
	
	// Detect tag changes
	if (hasTagChanges(originalContent, normalizedContent)) {
		changes.push({
			type: 'tags-normalized',
			description: 'Normalized tag formatting'
		});
	}
	
	// Detect wikilink changes
	if (hasWikilinkChanges(originalContent, normalizedContent)) {
		changes.push({
			type: 'wikilinks-normalized',
			description: 'Normalized wikilink paths'
		});
	}
	
	return {
		filePath,
		fileName,
		changes,
		originalContent,
		normalizedContent
	};
}

/**
 * Extract frontmatter from content
 */
function extractFrontmatter(content: string): string | null {
	const trimmed = content.trimStart();
	if (!trimmed.startsWith('---')) {
		return null;
	}
	
	const afterFirst = trimmed.slice(3);
	const endIndex = afterFirst.indexOf('\n---');
	
	if (endIndex === -1) {
		return null;
	}
	
	return afterFirst.slice(0, endIndex);
}

/**
 * Check if there are formatting changes
 */
function hasFormattingChanges(original: string, normalized: string): boolean {
	// Compare without considering specific formatting details
	const originalLines = original.split(/\r?\n/).filter(line => line.trim());
	const normalizedLines = normalized.split(/\r?\n/).filter(line => line.trim());
	
	// If non-empty lines are the same but overall content differs, it's formatting
	if (originalLines.join('\n') === normalizedLines.join('\n') && original !== normalized) {
		return true;
	}
	
	return false;
}

/**
 * Check if there are tag changes
 */
function hasTagChanges(original: string, normalized: string): boolean {
	const originalTags = (original.match(/#([a-zA-Z0-9_\-\/]+)/g) || []).sort();
	const normalizedTags = (normalized.match(/#([a-zA-Z0-9_\-\/]+)/g) || []).sort();
	
	return originalTags.join(',') !== normalizedTags.join(',');
}

/**
 * Check if there are wikilink changes
 */
function hasWikilinkChanges(original: string, normalized: string): boolean {
	const originalLinks = (original.match(/\[\[([^\]]+)\]\]/g) || []).sort();
	const normalizedLinks = (normalized.match(/\[\[([^\]]+)\]\]/g) || []).sort();
	
	return originalLinks.join(',') !== normalizedLinks.join(',');
}

/**
 * Format a change report as Markdown
 */
export function formatReportAsMarkdown(report: ChangeReport): string {
	let markdown = `# Linting Report: ${report.fileName}\n\n`;
	markdown += `**File Path**: \`${report.filePath}\`\n\n`;
	
	if (report.changes.length === 0) {
		markdown += '✓ No changes needed - file already conforms to linting rules\n\n';
		return markdown;
	}
	
	markdown += `## Changes Applied (${report.changes.length})\n\n`;
	
	for (const change of report.changes) {
		const lineInfo = change.lineNumber ? ` (line ${change.lineNumber})` : '';
		markdown += `- **${change.type}**${lineInfo}: ${change.description}\n`;
	}
	
	markdown += '\n';
	
	return markdown;
}

/**
 * Format multiple reports as a single Markdown document
 */
export function formatVaultReportAsMarkdown(reports: ChangeReport[]): string {
	const timestamp = new Date().toISOString();
	let markdown = `# Vault Linting Report\n\n`;
	markdown += `**Generated**: ${timestamp}\n`;
	markdown += `**Total Files Processed**: ${reports.length}\n\n`;
	
	const changedFiles = reports.filter(r => r.changes.length > 0);
	const unchangedFiles = reports.filter(r => r.changes.length === 0);
	
	markdown += `**Files with Changes**: ${changedFiles.length}\n`;
	markdown += `**Files Already Conforming**: ${unchangedFiles.length}\n\n`;
	
	if (changedFiles.length > 0) {
		markdown += `## Summary of Changes\n\n`;
		
		const changeTypes = new Map<string, number>();
		for (const report of changedFiles) {
			for (const change of report.changes) {
				changeTypes.set(change.type, (changeTypes.get(change.type) || 0) + 1);
			}
		}
		
		for (const [type, count] of Array.from(changeTypes.entries()).sort()) {
			markdown += `- **${type}**: ${count} file(s)\n`;
		}
		
		markdown += `\n## Files Modified\n\n`;
		
		for (const report of changedFiles) {
			markdown += `### ${report.fileName}\n\n`;
			markdown += `**Path**: \`${report.filePath}\`\n\n`;
			markdown += `**Changes**:\n`;
			for (const change of report.changes) {
				markdown += `- ${change.description}\n`;
			}
			markdown += '\n';
		}
	}
	
	if (unchangedFiles.length > 0 && unchangedFiles.length <= 20) {
		markdown += `## Files Already Conforming\n\n`;
		for (const report of unchangedFiles) {
			markdown += `- \`${report.filePath}\`\n`;
		}
		markdown += '\n';
	}
	
	return markdown;
}
