// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

function info() { vscode.window.showInformationMessage(arguments); }
function warning() { vscode.window.showWarningMessage(arguments); }
function error() { vscode.window.showErrorMessage(arguments); }

function objectFromSelection(editor) {
	let selection = editor.selection;
	let json = editor.document.getText(selection);
	let obj;

	try {
		obj = JSON.parse(json);
	}
	catch(err) {
		obj = undefined;
		warning('JSON Flattener: Selection is not valid JSON: ', err.message);
	}
	return obj;
}

function replaceSelection(editor, text) {
	let selection = editor.selection;
	editor.edit(builder => {
		builder.replace(selection, text);
	})
	.then(success => {
		if (success) {
			// Change the selection: start and end position of the new
			// selection is same, so it is not to select replaced text;
			var position = editor.selection.end;
			// editor.selection = new vscode.Selection(position, position);	// deselect
			editor.revealRange(new vscode.Range(position, position));	// show cursor at end of old selection
			info('JSON Flattener: selection contents flattened: '+success);
		}
	});
}

function isEmptyObject(obj) {
	for (var k in obj) {
		return false;
	}
	return true;
}

// Accumulates a deeply-nested object as items into array 'acc', recursively. Lines are later inserted.
// An array is used to avoid excessive reconcatenation with a bunch of temp objects as one long string.
function objToFlatArray(obj, acc, separators, prefix) {
	let t = (Array.isArray(obj)) ? 'array' : typeof obj;

	if (t === 'array') {
		// Special cases first for empty enumerables
		if (obj.length === 0) {
			acc.push(`  "${prefix}": []`)
		}
		else {
			for (const k in obj) {
				if (obj.hasOwnProperty(k)) {
					objToFlatArray(
						obj[k],
						acc,
						separators,
						`${prefix ? prefix + separators.arrL : ''}${k}${prefix ? separators.arrR : ''}`
					)
				}
			}
		}
	}
	else if (t === 'object') {
		if (isEmptyObject(obj)) {
			acc.push(`  "${prefix}": {}`)
		}
		else {
			for (const k in obj) {
				if (obj.hasOwnProperty(k)) {
					objToFlatArray(
						obj[k],
						acc,
						separators,
						`${prefix ? prefix + separators.obj : ''}${k}`
					)
				}
			}
		}
	}
	else if (t == 'string') {
		acc.push(`  "${prefix}": ${JSON.stringify(obj)}`)
	}
	else if (t == 'boolean') {
		acc.push(`  "${prefix}": ${obj}`)
	}
	else {
		acc.push(`  "${prefix}": ${obj}`)
	}
}
/**************************************************/

function selectionFlatten (style) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) return; // No text editor open

	let obj = objectFromSelection(editor);
	if (!obj) return;	// already reported

	let flatArray = [];
	let separators = {  // styles
		// appurist.json-flattener.selection
		'.': {
			'obj': '.',
			'arrL': '.',
			'arrR': '',
		},
		// appurist.json-flattener.selection-dotnet
		'__': {
			'obj': '__',
			'arrL': '__',
			'arrR': '',
		},
		// appurist.json-flattener.selection-javascript
		'js': {
			'obj': '.',
			'arrL': '[',
			'arrR': ']',
		},
	}
	objToFlatArray(obj, flatArray, separators[style]);
	let flatJSON = '{\n' + flatArray.join(',\n') + '\n}';
	return replaceSelection(editor, flatJSON);
}

// Command 2: appurist.json-flattener.pretty
// Command 3: appurist.json-flattener.unpretty
function selectionPretty (makePretty) {
	let editor = vscode.window.activeTextEditor;
	if (!editor) return; // No open text editor

	let obj = objectFromSelection(editor);
	if (!obj) return;	// already reported

	let json2 = JSON.stringify(obj, undefined, makePretty ? 2 : undefined);
	replaceSelection(editor, json2);
}

// Command 4: appurist.json-flattener.clipboard
async function clipboardFlatten () {
	let json;
	let lines = await vscode.env.clipboard.readText();
	if (lines) {
		if (Array.isArray(json)) {
			json = lines.join(' ');
		} else
		if (typeof lines == 'string')
		{
			json = lines.trim();
		} else {
			error('JSON Flattener: Unrecognized clipboard type: '+typeof lines)
			return;
		}
	}

	let obj;
	try {
		obj = JSON.parse(json);
	}
	catch(err) {
		warning('JSON Flattener: Clipboard is not valid JSON: ', err.message);
		return;
	}

	let json2 = JSON.stringify(obj);
	let success = await vscode.env.clipboard.writeText(json2);
	if (!success)
		error('JSON Flattener: Could not replace clipboard.');
}

/**************************************************
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable;

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	//console.log('Extension json-flattener: active.');

	// These commands have been defined in the package.json file.
	// Now we provide the implementation of the command with registerCommand().
	// The commandId parameter must match the command field in package.json.

	// Command 1: appurist.json-flattener.selection
	disposable = vscode.commands.registerCommand('appurist.json-flattener.selection', () => {
		selectionFlatten('.');
	});

	// Command 2: appurist.json-flattener.pretty
	disposable = vscode.commands.registerCommand('appurist.json-flattener.pretty', () => {
		selectionPretty(true);
	});

	// Command 3: appurist.json-flattener.unpretty
	disposable = vscode.commands.registerCommand('appurist.json-flattener.unpretty', () => {
		selectionPretty(false);
	});

	// Command 4: appurist.json-flattener.clipboard
	disposable = vscode.commands.registerCommand('appurist.json-flattener.clipboard', async  () => {
		await clipboardFlatten();
	});

	// Command 5: appurist.json-flattener.selection-dotnet
	disposable = vscode.commands.registerCommand('appurist.json-flattener.selection-dotnet', () => {
		selectionFlatten('__'); // use dotnet separator
	});

	// Command 6: appurist.json-flattener.selection-javascript
	disposable = vscode.commands.registerCommand('appurist.json-flattener.selection-javascript', () => {
		selectionFlatten('js'); // use JavaScript array separators
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
	//console.log('Extension json-flattener: deactivated.');
}

module.exports = {
	activate,
	deactivate
}
