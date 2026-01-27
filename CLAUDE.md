# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VS Code extension that flattens multi-level JSON objects into single-level dot notation. Published to the VS Code Marketplace as "JSON Flattener" by Appurist.

## Common Commands

```bash
npm run lint          # Run ESLint
npm test              # Run lint then VS Code integration tests (downloads VS Code)
npm run build         # Package extension with vsce
npm run release       # Publish to VS Code Marketplace
```

For development, use VS Code's "Run Extension" launch configuration (F5) to open a new VS Code window with the extension loaded.

## Architecture

This is a single-file extension (`extension.js`) with no external runtime dependencies.

**Key functions:**
- `selectionFlatten(style)` - Main flattening logic, supports three separator styles:
  - `'.'` - Standard dot notation (default)
  - `'__'` - Double underscore for .NET appsettings.json
  - `'js'` - JavaScript-style with bracket notation for arrays: `array[0].item`
- `selectionPretty(makePretty)` - JSON pretty-print or minify
- `clipboardFlatten()` - Operates on clipboard instead of selection
- `objToFlatArray()` - Recursive function that accumulates flattened key-value pairs

**Commands** (defined in package.json `contributes.commands`):
- `appurist.json-flattener.selection` - Flatten selection with dot notation
- `appurist.json-flattener.selection-dotnet` - Flatten with `__` separator
- `appurist.json-flattener.selection-javascript` - Flatten with JS array syntax
- `appurist.json-flattener.clipboard` - Flatten clipboard contents
- `appurist.json-flattener.pretty` - Pretty-print selection
- `appurist.json-flattener.unpretty` - Minify selection
