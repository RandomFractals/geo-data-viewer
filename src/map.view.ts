'use strict';
import { 
  workspace, 
  window, 
  Disposable, 
  Uri, 
  ViewColumn, 
  WorkspaceFolder, 
  Webview,
  WebviewPanel, 
  WebviewPanelOnDidChangeViewStateEvent, 
  WebviewPanelSerializer,
  commands
} from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as config from './config';
import {Logger} from './logger';
import {viewManager} from './view.manager';
import {Template} from './template.manager';

/**
 * Map webview panel serializer for restoring map views on vscode reload.
 */
export class MapViewSerializer implements WebviewPanelSerializer {

  private _logger: Logger;
  
  /**
   * Creates new webview serializer.
   * @param viewType Web view type.
   * @param extensionPath Extension path for loading scripts, examples and data.
   * @param template Webview html template.
   */
  constructor(private viewType: string, 
    private extensionPath: string, 
    private template: Template | undefined) {
    this._logger = new Logger(`${this.viewType}.serializer:`, config.logLevel);
  }

  /**
   * Restores webview panel on vscode reload for chart and data previews.
   * @param webviewPanel Webview panel to restore.
   * @param state Saved web view panel state.
   */
  async deserializeWebviewPanel(webviewPanel: WebviewPanel, state: any) {
    this._logger.debug('deserializeWeviewPanel(): url:', state.uri.toString());
    const viewColumn: ViewColumn = (webviewPanel.viewColumn) ? webviewPanel.viewColumn : ViewColumn.One;
    viewManager.add(
      new MapView(
        this.viewType,
        this.extensionPath, 
        Uri.parse(state.uri),
        viewColumn, 
        this.template, 
        webviewPanel
    ));
  }
}

/**
 * Map view implementation for this vscode extension.
 */
export class MapView {
    
  protected _disposables: Disposable[] = [];
  private _extensionPath: string;
  private _uri: Uri;
  private _viewUri: Uri;
  private _fileName: string;
  private _title: string;
  private _html: string = '';
  private _panel: WebviewPanel;
  private _logger: Logger;

  /**
   * Creates new map view.
   * @param viewType webview type, i.e. map.view.
   * @param extensionPath Extension path for loading webview scripts, etc.
   * @param uri data source uri.
   * @param viewColumn vscode IDE view column to display this view in.
   * @param template Webview html template reference.
   * @param panel Optional webview panel reference for restore on vscode IDE reload.
   */
  constructor(
    viewType: string,
    extensionPath: string, 
    uri: Uri, 
    viewColumn: ViewColumn, 
    template: Template | undefined, 
    panel?: WebviewPanel) {

    // save ext path, document uri, and create view uri
    this._extensionPath = extensionPath;
    this._uri = uri;
    this._fileName = path.basename(uri.fsPath);
    this._viewUri = this._uri.with({scheme: 'map.view'});
    this._logger = new Logger(`${viewType}:`, config.logLevel);

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
    if (template) {
      this._html = template?.content;
    }

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
  private initWebview(viewType: string, 
    viewColumn: ViewColumn, 
    viewPanel: WebviewPanel | undefined): WebviewPanel {
    if (!viewPanel) {
      // create new webview panel
      viewPanel = window.createWebviewPanel(viewType, this._title, viewColumn, this.getWebviewOptions());
      viewPanel.iconPath = Uri.file(path.join(this._extensionPath, './images/map.svg'));
      this._panel = viewPanel;
    }
    else {
      this._panel = viewPanel;
    }

    // dispose view
    viewPanel.onDidDispose(() => {
      this.dispose();
    }, null, this._disposables);

    // TODO: handle view state changes later
    viewPanel.onDidChangeViewState(
      (viewStateEvent: WebviewPanelOnDidChangeViewStateEvent) => {
      let active = viewStateEvent.webviewPanel.visible;
    }, null, this._disposables);

    // process web view messages
    this.webview.onDidReceiveMessage(message => {
      switch (message.command) {
        case 'refresh':
          this.refresh();
          break;
        case 'openFile':
          workspace.openTextDocument(this._uri).then(document => {
            window.showTextDocument(document, ViewColumn.One);
          });
          break;
        case 'showHelp':
          const helpUri: Uri = Uri.parse('https://github.com/RandomFractals/geo-data-viewer#usage');
          commands.executeCommand('vscode.open', helpUri);
          break;  
      }
    }, null, this._disposables);

    return viewPanel;
  } // end of initWebview()

  /**
   * Creates webview options with local resource roots, etc. for map webview display.
   */
  private getWebviewOptions(): any {
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
  private getLocalResourceRoots(): Uri[] {
    const localResourceRoots: Uri[] = [];
    const workspaceFolder: WorkspaceFolder | undefined = workspace.getWorkspaceFolder(this.uri);
    if (workspaceFolder) {
      localResourceRoots.push(workspaceFolder.uri);
    }
    else if (!this.uri.scheme || this.uri.scheme === 'file') {
      localResourceRoots.push(Uri.file(path.dirname(this.uri.fsPath)));
    }
    // add map view js scripts
    /* TODO:
    localResourceRoots.push(Uri.file(path.join(this._extensionPath, './node_modules/chart.js/dist')));
    */
    this._logger.debug('getLocalResourceRoots():', localResourceRoots);
    return localResourceRoots;
  }

  /**
   * Configures webview html for view display.
   */
  public configure(): void {
    this.webview.html = this.html;
    // NOTE: let webview fire refresh message
    // when map view DOM content is initialized
    // see: this.refresh();
  }

  /**
   * Reload map view on map data save changes or vscode IDE reload.
   */
  public refresh(): void {
    // reveal corresponding map view panel
    this._panel.reveal(this._panel.viewColumn, true); // preserve focus
    // open map view data text document
    workspace.openTextDocument(this.uri).then(document => {
      this._logger.debug('refresh(): file:', this._fileName);
      const mapData: string = document.getText();
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
        this._logger.debug('refresh():', error.message);
        this.webview.postMessage({error: error});
      }
    });
  }

  /**
   * Disposes this view resources.
   */
  public dispose() {
    viewManager.remove(this);
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
  get visible(): boolean {
    return this._panel.visible;
  }

  /**
   * Gets the underlying webview instance for this view.
   */
  get webview(): Webview {
    return this._panel.webview;
  }
    
  /**
   * Gets the source data uri for this view.
   */
  get uri(): Uri {
    return this._uri;
  }

  /**
   * Gets the view uri to load on commands triggers or vscode IDE reload. 
   */
  get viewUri(): Uri {
    return this._viewUri;
  }
  
  /**
   * Gets the html content to load for this preview.
   */
  get html(): string {
    return this._html;
  }
}
