# Obsidian Vault Linter

A deterministic, idempotent Markdown normalization plugin for Obsidian. This plugin enforces consistent formatting, frontmatter, tag conventions, and wikilink styles across your entire vault without relying on AI or external services.

## Goals

- **Deterministic**: Same input always produces the same output
- **Idempotent**: Running the linter multiple times produces the same result
- **No AI/External Dependencies**: Pure rule-based normalization
- **Minimal Diffs**: Only changes what's necessary to conform to rules
- **Safe**: Non-destructive checks available before applying changes

## Features

### 🗂️ Frontmatter Enforcement
- Automatically add frontmatter to notes that lack it
- Customizable frontmatter templates with variables (`{{title}}`, `{{date}}`)
- Validates existing frontmatter structure

### 📝 Formatting Normalization
- Consistent line endings (LF)
- Remove multiple consecutive blank lines
- Ensure files end with a single newline
- Deterministic whitespace handling

### 🏷️ Tag Rules
- Normalize tag formatting (lowercase, UPPERCASE, camelCase)
- Consistent tag structure across vault
- Works with both inline tags (`#tag`) and frontmatter tags

### 🔗 Safe Wikilink Insertion
- Normalize wikilink paths (shortest, relative, or absolute)
- Consistent alias formatting
- Validates wikilink structure

## Installation

### Manual Installation
1. Download the latest release from the [Releases](https://github.com/Suicynic/Obsidian-vault-linter/releases) page
2. Extract the files into your vault's `.obsidian/plugins/obsidian-vault-linter/` directory
3. Reload Obsidian
4. Enable "Obsidian Vault Linter" in Settings → Community Plugins

### Development Installation
```bash
# Clone the repository
git clone https://github.com/Suicynic/Obsidian-vault-linter.git

# Install dependencies
npm install

# Build the plugin
npm run build

# For development with auto-rebuild
npm run dev
```

## Usage

### Command Palette Commands

1. **Lint current file**: Apply all linting rules to the active file
2. **Lint all files in vault**: Apply linting rules to all markdown files
3. **Check current file (dry run)**: Check if current file conforms without making changes

### Settings

Configure the plugin behavior in Settings → Obsidian Vault Linter:

- **Frontmatter**: Toggle enforcement and customize template
- **Formatting**: Configure line ending and whitespace rules
- **Tags**: Set tag normalization format
- **Wikilinks**: Choose wikilink path style

## Architecture

The plugin follows a modular architecture with clear separation of concerns:

```
main.ts                    # Plugin entry point, command registration
settings.ts                # Settings interface and defaults
settingsTab.ts             # Settings UI
frontmatterEnforcer.ts     # Frontmatter validation and generation
formattingNormalizer.ts    # Formatting rules
tagRules.ts                # Tag normalization
wikilinkInserter.ts        # Wikilink validation and normalization
```

Each module is:
- **Independent**: Can be enabled/disabled individually
- **Stateless**: Pure functions based on settings
- **Testable**: Logic isolated from Obsidian API

## Development

### Building
```bash
npm run build    # Production build
npm run dev      # Development build with watch mode
```

### Project Structure
- TypeScript source files in root directory
- Compiled output: `main.js`
- Configuration: `manifest.json`, `package.json`, `tsconfig.json`
- Build system: esbuild (fast, minimal configuration)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Support

- Report issues: [GitHub Issues](https://github.com/Suicynic/Obsidian-vault-linter/issues)
- Feature requests: Open an issue with the "enhancement" label

## Roadmap

- [ ] Custom rule definitions via configuration
- [ ] Heading hierarchy validation
- [ ] Link validation (check for broken links)
- [ ] Batch operations with progress tracking
- [ ] Export/import rule configurations
- [ ] Integration with Obsidian's file explorer context menu