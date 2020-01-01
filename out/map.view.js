'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const path = require("path");
const config = require("./config");
const logger_1 = require("./logger");
const view_manager_1 = require("./view.manager");
/**
 * Map webview panel serializer for restoring map views on vscode reload.
 */
class MapViewSerializer {
    /**
     * Creates new webview serializer.
     * @param viewType Web view type.
     * @param extensionPath Extension path for loading scripts, examples and data.
     * @param template Webview html template.
     */
    constructor(viewType, extensionPath, template) {
        this.viewType = viewType;
        this.extensionPath = extensionPath;
        this.template = template;
        this._logger = new logger_1.Logger(`${this.viewType}.serializer:`, config.logLevel);
    }
    /**
     * Restores webview panel on vscode reload for chart and data previews.
     * @param webviewPanel Webview panel to restore.
     * @param state Saved web view panel state.
     */
    deserializeWebviewPanel(webviewPanel, state) {
        return __awaiter(this, void 0, void 0, function* () {
            this._logger.logMessage(logger_1.LogLevel.Debug, 'deserializeWeviewPanel(): url:', state.uri.toString());
            const viewColumn = (webviewPanel.viewColumn) ? webviewPanel.viewColumn : vscode_1.ViewColumn.One;
            view_manager_1.viewManager.add(new MapView(this.viewType, this.extensionPath, vscode_1.Uri.parse(state.uri), viewColumn, this.template, webviewPanel));
        });
    }
}
exports.MapViewSerializer = MapViewSerializer;
/**
 * Main map view webview implementation for this vscode extension.
 */
class MapView {
    /**
     * Creates new map view.
     * @param viewType webview type, i.e. map.view.
     * @param extensionPath Extension path for loading webview scripts, etc.
     * @param uri map view data uri.
     * @param viewColumn vscode IDE view column to display chart preview in.
     * @param template Webview html template reference.
     * @param panel Optional webview panel reference for restore on vscode IDE reload.
     */
    constructor(viewType, extensionPath, uri, viewColumn, template, panel) {
        var _a;
        this._disposables = [];
        this._html = '';
        // save ext path, document uri, and create view uri
        this._extensionPath = extensionPath;
        this._uri = uri;
        this._fileName = path.basename(uri.fsPath);
        this._viewUri = this._uri.with({ scheme: 'map' });
        this._logger = new logger_1.Logger(`${viewType}:`, config.logLevel);
        // create webview panel title
        switch (viewType) {
            case 'map.view':
                this._title = this._fileName;
                break;
            default: // map.help
                this._title = 'Map Help';
                break;
        }
        // create html template for the webview with scripts path replaced
        /* TODO
        const scriptsPath: string = Uri.file(path.join(this._extensionPath, './node_modules/chart.js/dist'))
          .with({scheme: 'vscode-resource'}).toString(true);
        if (template) {
          this._html = template.content.replace(/\{scripts\}/g, scriptsPath);
        }*/
        this._html = (_a = template) === null || _a === void 0 ? void 0 : _a.name;
        // initialize webview panel
        this._panel = this.initWebview(viewType, viewColumn, panel);
        this.configure();
    } // end of constructor()
    /**
     * Initializes map webview panel.
     * @param viewType Map webview type, i.e. map.view.
     * @param viewColumn vscode IDE view column to display preview in.
     * @param viewPanel Optional web view panel to initialize.
     */
    initWebview(viewType, viewColumn, viewPanel) {
        if (!viewPanel) {
            // create new webview panel
            viewPanel = vscode_1.window.createWebviewPanel(viewType, this._title, viewColumn, this.getWebviewOptions());
            viewPanel.iconPath = vscode_1.Uri.file(path.join(this._extensionPath, './images/map.svg'));
            this._panel = viewPanel;
        }
        else {
            this._panel = viewPanel;
        }
        // dispose preview panel 
        viewPanel.onDidDispose(() => {
            this.dispose();
        }, null, this._disposables);
        // TODO: handle view state changes later
        viewPanel.onDidChangeViewState((viewStateEvent) => {
            let active = viewStateEvent.webviewPanel.visible;
        }, null, this._disposables);
        // process web view messages
        this.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'refresh':
                    this.refresh();
                    break;
                case 'openFile':
                    vscode_1.workspace.openTextDocument(this._uri).then(document => {
                        vscode_1.window.showTextDocument(document, vscode_1.ViewColumn.One);
                    });
                    break;
                case 'showHelp':
                    const helpUri = vscode_1.Uri.parse('https://github.com/RandomFractals/geo-data-viewer#usage');
                    vscode_1.commands.executeCommand('vscode.open', helpUri);
                    break;
            }
        }, null, this._disposables);
        return viewPanel;
    } // end of initWebview()
    /**
     * Creates webview options with local resource roots, etc. for map webview display.
     */
    getWebviewOptions() {
        return {
            enableScripts: true,
            enableCommandUris: true,
            retainContextWhenHidden: true,
            localResourceRoots: this.getLocalResourceRoots()
        };
    }
    /**
     * Creates local resource roots for loading scripts in map webview.
     */
    getLocalResourceRoots() {
        const localResourceRoots = [];
        const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(this.uri);
        if (workspaceFolder) {
            localResourceRoots.push(workspaceFolder.uri);
        }
        else if (!this.uri.scheme || this.uri.scheme === 'file') {
            localResourceRoots.push(vscode_1.Uri.file(path.dirname(this.uri.fsPath)));
        }
        // add map view js scripts
        /* TODO:
        localResourceRoots.push(Uri.file(path.join(this._extensionPath, './node_modules/chart.js/dist')));
        */
        this._logger.logMessage(logger_1.LogLevel.Debug, 'getLocalResourceRoots():', localResourceRoots);
        return localResourceRoots;
    }
    /**
     * Configures webview html for preview.
     */
    configure() {
        this.webview.html = this.html;
        // NOTE: let webview fire refresh message
        // when map view DOM content is initialized
        // see: this.refresh();
    }
    /**
     * Reload map view on map data save changes or vscode IDE reload.
     */
    refresh() {
        // reveal corresponding map view panel
        this._panel.reveal(this._panel.viewColumn, true); // preserve focus
        // open map view data text document
        vscode_1.workspace.openTextDocument(this.uri).then(document => {
            this._logger.logMessage(logger_1.LogLevel.Debug, 'refresh(): file:', this._fileName);
            const mapData = document.getText();
            try {
                const mapConfig = JSON.parse(mapData);
                this.webview.postMessage({
                    command: 'refresh',
                    fileName: this._fileName,
                    uri: this._uri.toString(),
                    config: mapConfig,
                });
            }
            catch (error) {
                this._logger.logMessage(logger_1.LogLevel.Error, 'refresh():', error.message);
                this.webview.postMessage({ error: error });
            }
        });
    }
    /**
     * Disposes this view resources.
     */
    dispose() {
        view_manager_1.viewManager.remove(this);
        this._panel.dispose();
        while (this._disposables.length) {
            const item = this._disposables.pop();
            if (item) {
                item.dispose();
            }
        }
    }
    /**
     * Gets view panel visibility status.
     */
    get visible() {
        return this._panel.visible;
    }
    /**
     * Gets the underlying webview instance for this view.
     */
    get webview() {
        return this._panel.webview;
    }
    /**
     * Gets the source data uri for this view.
     */
    get uri() {
        return this._uri;
    }
    /**
     * Gets the view uri to load on commands triggers or vscode IDE reload.
     */
    get viewUri() {
        return this._viewUri;
    }
    /**
     * Gets the html content to load for this preview.
     */
    get html() {
        return this._html;
    }
}
exports.MapView = MapView;
//# sourceMappingURL=map.view.js.map