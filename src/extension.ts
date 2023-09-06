import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	vscode.languages.registerDefinitionProvider('yaml', {
		provideDefinition: (document, position, token) => {
			const line = document.lineAt(position);
			const word = line.text.replace(/-.*template.*:\s*/, '').trim();

			if (!line.text.match(/template\s*:/)) {
				return null;
			}

			if (word.match(/\$/)) {
				let globFilter = word;
				globFilter = globFilter.replace(/\$\{.*?\}+/g, '**');
				globFilter = globFilter.replace(/\$\(.*?\)+/g, '**');

				const filename = globFilter.replace(/.*\//, '');
				const directory = globFilter.replace(/[^\\/]+$/, '');
				const currentDirectory = document.uri.fsPath.replace(/[^\\/]+$/, '');
				
				const files = vscode.workspace.findFiles(new vscode.RelativePattern(currentDirectory + "/" + directory, "**/"+filename));
				return files.then((uris) => {
					return uris.map((uri) => {
						return new vscode.Location(uri, new vscode.Position(0, 0));
					});
				});
			}

			const uri = document.uri.with({ path: document.uri.path.replace(/[^\\/]+$/, word) });
			return new vscode.Location(uri, new vscode.Position(0, 0));
		}
	});
}
