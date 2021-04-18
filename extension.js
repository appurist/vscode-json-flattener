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
function objToFlatArray(obj, acc, prefix) {
	let prefixDot = prefix ? prefix + '.' : '';
	let t = typeof obj;
	let isArray = Array.isArray(obj);

	// Special cases first for empty enumerables
	if (isArray && (obj.length === 0)) {
		acc.push(`  "${prefix}": []`)
	}
	else if (t === 'object' && isEmptyObject(obj)) {
		acc.push(`  "${prefix}": {}`)
	}
	else if ((t === 'object') || isArray) {
		for (const k in obj) {
			if (obj.hasOwnProperty(k)) {
				objToFlatArray(obj[k], acc, `${prefixDot}${k}`);
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


//////////////////////
// *** REWRITE TO OUTPUT JSON RATHER THAN NESTED OBJECT ****

// level is 1-based, 1..length
function unflatSubObj(obj, acc, tok, level) {
	let n = level-1;

	if (level < tok.length) {
		// not a leaf member
		if (!acc.hasOwnProperty(tok[n]))
			acc[tok[n]] = { }
		unflatSubObj(obj, acc, tok, level+1);
	} else {
		// a leaf member
		let parent = acc[tok[0]];
		let px = 1;
		while (px < n)
			parent = parent[tok[px++]];
		let id = tok.join('.')
		parent[tok[n]] = obj[id];
	}
}

function objToUnflatObj(obj, acc) {
	for (let k in obj) {
		let tok = k.split('.');
		unflatSubObj(obj, acc, tok, 1);	// 1-based, 1..length
	}
}
/**************************************************/

// Command 1: appurist.json-flattener.selection
function selectionFlatten () {
	let editor = vscode.window.activeTextEditor;
	if (!editor) return; // No text editor open

	let obj = objectFromSelection(editor);
	if (!obj) return;	// already reported

	let flatArray = [];
	objToFlatArray(obj, flatArray);
	let flatJSON = '{\n' + flatArray.join(',\n') + '\n}';
	return replaceSelection(editor, flatJSON);
}

// Command 2: appurist.json-flattener.selection-unflatten
function selectionUnflatten () {
	let editor = vscode.window.activeTextEditor;
	if (!editor) return; // No text editor open

	let obj = objectFromSelection(editor);
	if (!obj) return;	// already reported

	// First flatten it to make sure it's flat.
	let unflatObj = { };
	objToUnflatObj(obj, unflatObj);

	let unflatJSON = JSON.stringify(unflatObj, undefined, 2);
	return replaceSelection(editor, unflatJSON);
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

// Command 4: appurist.json-flattener.clipboard-unflatten
async function clipboardUnflatten () {
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
		selectionFlatten();
	});

	// Command 2: appurist.json-flattener.selection-unflatten
	disposable = vscode.commands.registerCommand('appurist.json-flattener.selection-unflatten', () => {
		selectionUnflatten();
	});

	// Command 3: appurist.json-flattener.clipboard
	disposable = vscode.commands.registerCommand('appurist.json-flattener.clipboard', async  () => {
		await clipboardFlatten();
	});

	// Command 4: appurist.json-flattener.clipboard-unflatten
	disposable = vscode.commands.registerCommand('appurist.json-flattener.clipboard-unflatten', async  () => {
		await clipboardUnflatten();
	});

	// Command 5: appurist.json-flattener.pretty
	disposable = vscode.commands.registerCommand('appurist.json-flattener.pretty', () => {
		selectionPretty(true);
	});

	// Command 6: appurist.json-flattener.unpretty
	disposable = vscode.commands.registerCommand('appurist.json-flattener.unpretty', () => {
		selectionPretty(false);
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
