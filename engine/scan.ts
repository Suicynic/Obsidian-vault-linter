/**
 * Scan utilities for detecting code blocks, headings, links, and other Markdown structures
 * Used by other modules to avoid modifying code blocks and other protected content
 */

/**
 * Represents a range in text content
 */
export interface TextRange {
	start: number;
	end: number;
	type: 'code-block' | 'inline-code' | 'heading' | 'wikilink' | 'tag';
	content: string;
}

/**
 * Detect fenced code blocks (```...```) in content
 */
export function detectCodeBlocks(content: string): TextRange[] {
	const ranges: TextRange[] = [];
	
	// Detect fenced code blocks (```...```)
	const fencedRegex = /```[\s\S]*?```/g;
	let match;
	while ((match = fencedRegex.exec(content)) !== null) {
		ranges.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'code-block',
			content: match[0]
		});
	}
	
	return ranges;
}

/**
 * Detect inline code (`...`) in content
 */
export function detectInlineCode(content: string): TextRange[] {
	const ranges: TextRange[] = [];
	const inlineRegex = /`[^`]+`/g;
	let match;
	
	while ((match = inlineRegex.exec(content)) !== null) {
		ranges.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'inline-code',
			content: match[0]
		});
	}
	
	return ranges;
}

/**
 * Detect headings (# ... ######) in content
 */
export function detectHeadings(content: string): TextRange[] {
	const ranges: TextRange[] = [];
	const headingRegex = /^(#{1,6})\s+(.+)$/gm;
	let match;
	
	while ((match = headingRegex.exec(content)) !== null) {
		ranges.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'heading',
			content: match[0]
		});
	}
	
	return ranges;
}

/**
 * Detect wikilinks ([[...]]) in content
 */
export function detectWikilinks(content: string): TextRange[] {
	const ranges: TextRange[] = [];
	const wikilinkRegex = /\[\[([^\]]+)\]\]/g;
	let match;
	
	while ((match = wikilinkRegex.exec(content)) !== null) {
		ranges.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'wikilink',
			content: match[0]
		});
	}
	
	return ranges;
}

/**
 * Detect inline tags (#tag) in content
 */
export function detectTags(content: string): TextRange[] {
	const ranges: TextRange[] = [];
	const tagRegex = /#([a-zA-Z0-9_\-\/]+)/g;
	let match;
	
	while ((match = tagRegex.exec(content)) !== null) {
		ranges.push({
			start: match.index,
			end: match.index + match[0].length,
			type: 'tag',
			content: match[0]
		});
	}
	
	return ranges;
}

/**
 * Check if a position is inside any of the given ranges
 */
export function isInRange(position: number, ranges: TextRange[]): boolean {
	return ranges.some(range => position >= range.start && position < range.end);
}

/**
 * Get all protected ranges (code blocks and inline code) where content should not be modified
 */
export function getProtectedRanges(content: string): TextRange[] {
	return [
		...detectCodeBlocks(content),
		...detectInlineCode(content)
	].sort((a, b) => a.start - b.start);
}
