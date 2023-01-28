# **json-flattener - README**

This package is [an extension for Visual Studio Code (VS Code)](https://marketplace.visualstudio.com/items?itemName=Appurist.json-flattener) that provides commands to flatten multi-level JSON definitions to single-level dot notation.

## Features

- Supports flattening a JSON object marked as the editor selection
- Supports flattening a JSON object present in the clipboard
- Supports prettying (reformatting) JSON
- Suppports unprettying (reformatting "tight")

![Demo image](images/flattener.gif)

## Commands Provided By The Extension

> Warning: In all of the commands below, the original text is replaced with the converted text. This means **the original text is lost**(although you can use Undo to restore it).

There are four commands provided by this extension:

### Flatten (Selection) `appurist.json-flattener.selection`

This is the primary function of this extension. It converts a multi-level JSON, *marked by the current editor text selection*, into single-level dot-notation JSON block. Once converted, it *replaces* the current selection with the new JSON flattened object. See images below.

### Flatten (Clipboard) `appurist.json-flattener.clipboard`

This is the alternate form. It also converts a multi-level JSON into  single-level dot-notation JSON block, however it looks for the source text in the clipboard. Once converted, it *replaces* the current clipboard with the new JSON flattened object.

### Flatten (Selection) `appurist.json-flattener.pretty`

This is a convenience function, provided because it was almost free to do so. It simply applies a 2-space JSON "pretty" stringify reformatting of the current selection.

### Flatten (Selection) `appurist.json-flattener.unpretty`

This is a convenience function, provided because it was almost free to do so. It simply applies a minimal JSON "unpretty" stringify reformatting of the current selection without much whitespace.

### Flatten (Selection - dotnet__separator) `appurist.json-flattener.selection-dotnet`

Like `appurist.json-flattener.selection`, this command converts a multi-level JSON, *marked by the current editor text selection*, into single-level JSON block, but uses `__` as the separator rather than the usual `'.'`. Once converted, it *replaces* the current selection with the new JSON flattened object. This is useful for flattening dotnet's appsettings.json.

### Flatten (Selection - JavaScript[arrays]) `appurist.json-flattener.selection-javascript`

Like `appurist.json-flattener.selection`, this command converts a multi-level JSON, *marked by the current editor text selection*, into single-level JSON block, but array item numbers are surrounded by square brackets to be compatable with JavaScript/TypeScript. Once converted, it *replaces* the current selection with the new JSON flattened object.

## Visual Demo
Before flattening:
![Before image](images/flattener1.png)

After flattening:
![After image](images/flattener2.png)

## Extension Settings

There are no configurable settings for this extension at this time.

## Known Issues

None.

## Release Notes

### 1.1.0

- Added JavaScript compatable flatten, eg `array[8].item`
- internal API changes

### 1.0.6

- Updated all dependencies.
- Added the "Flatten (Selection - dotnet__separator)" `appurist.json-flattener.selection-dotnet` command.
- Fixed problems activating the pretty and unpretty selection commands.

### 1.0.5

- Removed the experimental unflatten commands that weren't complete, working or ready yet.

### 1.0.4

- Fixed problems flattening strings with embedded " characters and escaped characters like "\n".
- Fixes Issue #2 https://github.com/appurist/vscode-json-flattener/issues/2

### 1.0.3

- Automated low-priority security update to bump lodash from 4.17.15 to 4.17.19.

### 1.0.2

- Moved the logo to the end to avoid double logo at start in marketplace.
- Updated the readme to show this.

### 1.0.1

- Fixed the publishing category to be "Formatters", and added the logo.

### 1.0.0

- Initial release of this JSON Flattener.

![Demo image](images/logo.png)
