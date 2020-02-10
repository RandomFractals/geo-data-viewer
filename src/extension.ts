'use strict';
import {
  workspace, 
  window, 
  commands, 
  ExtensionContext,
  Disposable,
  Uri, 
  ViewColumn, 
  TextDocument,
  TextDocumentChangeEvent
} from 'vscode';
import * as path from 'path';
import * as config from './config';
import {Logger} from './logger';
import {MapView, MapViewSerializer} from './map.view';
import {viewManager} from './view.manager';
import {Template, ITemplateManager, TemplateManager} from './template.manager';

// extension logger
const logger: Logger = new Logger('geo.data.viewer:', config.logLevel);

/**
 * Activates this extension per rules set in package.json.
 * @param context vscode extension context.
 * @see https://code.visualstudio.com/api/references/activation-events for more info.
 */
export function activate(context: ExtensionContext) {
  const extensionPath: string = context.extensionPath;
	// logger.info('activate(): activating from extPath:', context.extensionPath);
	
	// initialize geo data viewer webview panel templates
	const templateManager: ITemplateManager = new TemplateManager(context.asAbsolutePath('web'));
	const mapViewTemplate: Template | undefined = templateManager.getTemplate('map.view.html');

	// register map view serializer for restore on vscode restart
  window.registerWebviewPanelSerializer('map.view', 
    new MapViewSerializer('map.view', extensionPath, mapViewTemplate));

	// add Geo: View Map command
  const mapWebview: Disposable = 
    createMapViewCommand('map.view', extensionPath, mapViewTemplate);
	context.subscriptions.push(mapWebview);

	// add Geo: View Map from URL command
	const viewRemoteMap: Disposable = commands.registerCommand('map.view.url', () => {
		window.showInputBox({
			ignoreFocusOut: true,
			placeHolder: 'https://gist.github.com/.../*.json or https://kepler.gl/#/demo?mapUrl=...',
			prompt: 'Input map config URL'
		}).then((mapUrl) => {
			if (mapUrl && mapUrl !== undefined && mapUrl.length > 0) {
				const mapUri: Uri = Uri.parse(mapUrl);
				// launch new remote map view
				commands.executeCommand('map.view', mapUri);
			}  
		});
	});
	context.subscriptions.push(viewRemoteMap);

	// refresh associated map view on geo data file save
	workspace.onDidSaveTextDocument((document: TextDocument) => {
		if (isGeoDataFile(document)) {
			const uri: Uri = document.uri.with({scheme: 'map.view'});
			const mapView: MapView | undefined = viewManager.find(uri);
			if (mapView) {
				mapView.refresh();
			}
		}
	});

	// reset associated map view on geo data file change
	workspace.onDidChangeTextDocument((changeEvent: TextDocumentChangeEvent) => {
		if (isGeoDataFile(changeEvent.document)) {
			const uri: Uri = changeEvent.document.uri.with({scheme: 'map.view'});
			const mapView: MapView | undefined = viewManager.find(uri);
			if (mapView && changeEvent.contentChanges.length > 0) {
				// TODO: add refresh interval before enabling this
				// mapView.refresh();
			}
		}
	});

	// reset all views on config change
	workspace.onDidChangeConfiguration(() => {
		viewManager.configure();
	});

	logger.info('activate(): activated! extPath:', context.extensionPath);
} // end of activate()

/**
 * Deactivates this vscode extension to free up resources.
 */
export function deactivate() {
  // TODO: add extension cleanup code, if needed
}

/**
 * Creates map.view command.
 * @param viewType View command type.
 * @param extensionPath Extension path for loading scripts, examples and data.
 * @param viewTemplate View html template.
 */
function createMapViewCommand(viewType: string, 
	extensionPath: string, viewTemplate: Template | undefined): Disposable {
  const mapWebview: Disposable = commands.registerCommand(viewType, (uri) => {
    let resource: any = uri;
    let viewColumn: ViewColumn = getViewColumn();
    if (!(resource instanceof Uri)) {
      if (window.activeTextEditor) {
        resource = window.activeTextEditor.document.uri;
      } else {
        window.showInformationMessage('Open a geo data file to view map.');
        return;
      }
		}
    const mapView: MapView = new MapView(viewType,
      extensionPath, resource, viewColumn, viewTemplate);		
    viewManager.add(mapView);
    return mapView.webview;
  });
  return mapWebview;
}

/**
 * Gets map view display view column
 * based on active editor view column.
 */
function getViewColumn(): ViewColumn {
	let viewColumn: ViewColumn = ViewColumn.One;
	const activeEditor = window.activeTextEditor;
	if (activeEditor && activeEditor.viewColumn) {
		viewColumn = activeEditor.viewColumn; // + 1; // for view on side ...
	}
	return viewColumn;
}

/**
 * Checks if the vscode text document is a geo data file.
 * @param document The vscode text document to check.
 */
function isGeoDataFile(document: TextDocument): boolean {
	const fileName: string = path.basename(document.uri.fsPath);
  return config.supportedDataFiles.test(fileName);
}
