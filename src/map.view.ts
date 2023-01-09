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

import * as flatgeobuf from 'flatgeobuf/lib/mjs/geojson';
import * as shapefile from 'shpjs';
import * as togeojson from '@mapbox/togeojson';
import * as topojson from 'topojson-client';
import * as xmldom from 'xmldom';

import * as config from './config';
import * as fileUtils from './utils/file.utils';
import {Logger, LogLevel} from './logger';
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
  private _url: string;
  private _fileName: string;
  private _fileExtension: string;
  private _fileSize: number = 0;
  private _title: string;
  private _isRemoteData: boolean = false;
  private _content: string = '';
  private _mapData: any = [];
  private _mapConfig: any = {};
  private _rowCount: number = 0;
  private _html: string = '';
  private _viewUri: Uri;
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
    this._url = uri.toString(true);
    this._fileName = path.basename(uri.fsPath);
    this._fileExtension = path.extname(this._fileName);
    // check for remote geo data load
    if (this._url.startsWith('http://') || this._url.startsWith('https:')) {
      this._isRemoteData = true;
    }
    // adjust for keplergl demo app url input ...
    if (this._url.startsWith('https://kepler.gl/demo?mapUrl=')) {
      // init map view uri from kepler.gl demo map config url query string
      this._url = this._url.replace('https://kepler.gl/demo?mapUrl=', '');
      this._uri = Uri.parse(this._url);
      const pathTokens: Array<string> = this._uri.path.split('/');
      this._fileName = pathTokens[pathTokens.length-1]; // last in url
      this._isRemoteData = true;
    }
    this._viewUri = this._uri.with({scheme: 'map.view'});
    this._logger = new Logger(`${viewType}:`, config.logLevel);

    // initialize base map config for geo data files loading
    this._mapConfig = config.mapConfigTemplate;

    // set map style to default map style user setting
    this._mapConfig.config.mapStyle.styleType = this.mapStyle;

    // initialize webview panel
    this._panel = this.initWebview(viewType, viewColumn, panel, template);
    this.configure();
  } // end of constructor()

  /**
   * Initializes map webview panel.
   * @param viewType Map webview type, i.e. map.view.
   * @param viewColumn vscode IDE view column to display preview in.
   * @param viewPanel Optional web view panel to initialize.
   * @param template Webview html template.
   */
  private initWebview(viewType: string,
    viewColumn: ViewColumn,
    viewPanel: WebviewPanel | undefined,
    template: Template): WebviewPanel {

    // create webview panel title
    switch (viewType) {
      case 'map.view':
        this._title = this._fileName;
        break;
      default: // map.help
        this._title = 'Map Help';
        break;
    }

    if (!viewPanel) {
      // create new webview panel
      viewPanel = window.createWebviewPanel(viewType, this._title, viewColumn, this.getWebviewOptions());
      viewPanel.iconPath = Uri.file(path.join(this._extensionPath, './images/map.svg'));
      this._panel = viewPanel;
    }
    else {
      this._panel = viewPanel;
    }

    // create webview html template
    const stylesPath: string = this.webview.asWebviewUri(
      Uri.file(path.join(this._extensionPath, 'web/styles'))).toString(true);
    const scriptsPath: string = this.webview.asWebviewUri(
      Uri.file(path.join(this._extensionPath, 'web/scripts'))).toString(true);
    const imagesPath: string = this.webview.asWebviewUri(
        Uri.file(path.join(this._extensionPath, 'web/images'))).toString(true);
    const cspSource: string = this.webview.cspSource;
    if (template) {
      this._html = template?.replace({
        cspSource: cspSource,
        styles: stylesPath,
        scripts: scriptsPath,
        images: imagesPath,
        fileName: this._fileName,
        mapboxToken: config.mapboxToken,
        theme: this.theme
      });
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
          // loads map view, config and data
          this.refresh();
          break;
        case 'saveData':
          // saves map config, json data, html, or map png image
          this.saveData(message.data, message.fileType);
          break;
        case 'openFile':
          workspace.openTextDocument(this._uri).then(document => {
            window.showTextDocument(document, ViewColumn.One);
          });
          break;
        case 'openGeoDataFile':
          this.openGeoDataFile();
          break;
        case 'showMapGallery':
          commands.executeCommand('map.gallery');
          break;
        case 'loadView':
          // launch new view
          this.loadView(message.viewName, message.uri);
          break;
      }
    }, null, this._disposables);

    return viewPanel;
  } // end of initWebview()

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
    // add web view images, styles and scripts folders
    localResourceRoots.push(Uri.file(path.join(this._extensionPath, './web/styles')));
    localResourceRoots.push(Uri.file(path.join(this._extensionPath, './web/scripts')));
    localResourceRoots.push(Uri.file(path.join(this._extensionPath, './web/images')));
    this._logger.debug('getLocalResourceRoots():', localResourceRoots);
    return localResourceRoots;
  }

  /**
   * Shows open file dialog for launchign new geo data map view.
   */
  private async openGeoDataFile() {
    // display open geo data file dialog
    let openFolderUri: Uri = Uri.parse(this._url).with({scheme: 'file'});
    const workspaceFolders: readonly WorkspaceFolder[] | undefined = workspace.workspaceFolders;
    if (workspaceFolders && workspaceFolders.length >= 1) {
      // change open file folder uri to the 1st workspace folder, usuallay workspace root
      openFolderUri = workspaceFolders[0].uri;
    }
    const selectedFiles: Array<Uri> | undefined = await window.showOpenDialog({
      defaultUri: openFolderUri,
      canSelectMany: false,
      canSelectFolders: false,
      filters: config.openFileFilters
    });
    if (selectedFiles && selectedFiles.length >= 1) {
      // launch new map view for the selected geo data file
      this.loadView('map.view', selectedFiles[0].toString(true)); // skip encoding
    }
  }

 /**
   * Launches new view via commands.executeCommand interface.
   * @param viewName View name to launch.
   * @param url View document url parameter.
   * @see https://code.visualstudio.com/api/extension-guides/command
   */
  private loadView(viewName: string, url: string): void {
    const fileUri: Uri = Uri.parse(url);
    try {
      this._logger.debug(`loadView(): loading view... \n ${viewName}`, url);
        //fileUri.toString(true)); // skip encoding
      if (url.startsWith('http://') || url.startsWith('https://')) {
        // launch requested remote data view command
        this._logger.debug(`loadView():executeCommand: \n ${viewName}`, url);
        commands.executeCommand(viewName, fileUri);
      }
      else if (fs.existsSync(fileUri.fsPath)) {
        // launch requested local data view command
        this._logger.debug(`loadView():executeCommand: \n ${viewName}`, fileUri.fsPath);
        commands.executeCommand(viewName, fileUri);
      }
      else {
        // try to find requested data file(s) in open workspace
        workspace.findFiles(`**/${url}`).then(files => {
          if (files.length > 0) {
            // pick the 1st matching file from the workspace
            const dataUri: Uri = files[0];
            // launch requested view command
            this._logger.debug(`loadView():executeCommand: \n ${viewName}`, dataUri.toString(true)); // skip encoding
            commands.executeCommand(viewName, dataUri);
          } else {
            this._logger.error(`loadView(): Error:\n no such files in this workspace:`, url);
            window.showErrorMessage(`No '**/${url}' file(s) found in this workspace!`);
          }
        });
      }
    } catch (error) {
      this._logger.error(`loadView(${url}): Error:\n`, error.message);
      window.showErrorMessage(`Failed to load '${viewName}' for document: '${url}'! Error:\n${error.message}`);
    }
  } // end of loadView()

  /**
   * Reload map view on map data save changes or vscode IDE reload.
   */
  public async refresh(): Promise<void> {
    // reveal corresponding map view panel
    this._panel.reveal(this._panel.viewColumn, true); // preserve focus

    // determine data file encoding
    const dataEncoding: string =
      (this._fileExtension.endsWith('.shp') || this._fileExtension.endsWith('.fgb')) ? null: 'utf8'; // default
    if (this._url.startsWith('https://') && dataEncoding === 'utf8') {
      // load remote text geo data file
      this._content = String(await fileUtils.readDataFile(this._url, dataEncoding));
      this.refreshView();
    }
    else if (dataEncoding === 'utf8') {
      // open map view data text document
      workspace.openTextDocument(this.uri).then(document => {
        this._logger.debug('refresh(): file:', this._fileName);
        this._content = document.getText();
        this.refreshView();
      });
    }
    else {
      // delegate to refresh view for loading binary shapefiles
      this.refreshView();
    }
  }

  /**
   * Sends updated map config and data to map webview.
   */
  public async refreshView() {
    const dataUrl: string = (this._isRemoteData) ? this._url: this._uri.fsPath; // local data file path
    try {
      // load map data
      switch (this._fileExtension) {
        case '.csv':
        case '.igc':
        case '.gml':
        case '.wkt':
          // just pass through raw string content
          this._mapData = this._content;
          this.refreshMapView();
          break;
        case '.gpx':
          // parse gpx
          const gpx = new xmldom.DOMParser().parseFromString(this._content);
          // convert it to geojson
          this._mapData = togeojson.gpx(gpx, {styles: true});
          this.createGeoJsonFile(this._mapData);
          this.refreshMapView();
          break;
        case '.kml':
          // parse kml
          const kml = new xmldom.DOMParser().parseFromString(this._content);
          // convert it to geojson
          this._mapData = togeojson.kml(kml, {styles: true});
          this.createGeoJsonFile(this._mapData);
          this.refreshMapView();
          break;
        case '.fgb':
          // read flat geo buggers file
          const flatGeoBufferData = await fileUtils.readDataFile(dataUrl, null);
          this._mapData = flatgeobuf.deserialize(flatGeoBufferData);
          this.createGeoJsonFile(this._mapData);
          this.refreshMapView();
          break;
        case '.shp':
          // read shapefiles
          // todo: move this to new data manager and geo data providers api
          const shapefileData = await fileUtils.readDataFile(dataUrl, null);
          const prjData =
            await fileUtils.readDataFile(dataUrl.replace('.shp', '.prj'), 'utf8');
          const dbfData =
            await fileUtils.readDataFile(dataUrl.replace('.shp', '.dbf'), null);
          this._mapData = shapefile.combine([
              shapefile.parseShp(shapefileData, prjData),
              shapefile.parseDbf(dbfData)
            ]);
            this.createGeoJsonFile(this._mapData);
            this.refreshMapView();
          break;
        case '.geojson':
        case '.json':
        case '.topojson':
          // parse json data content
          const data = JSON.parse(this._content);
          if (Array.isArray(data)) {
            // must be map data
            this._mapData = data;
          }
          else if (data['datasets'] !== undefined) { // add more checks here ???
            // must be keplergl json with map data and config
            this._mapData = data['datasets'];
            this._mapConfig = data['config'];
          }
          else if (data['type'] === 'FeatureCollection') {
            // must be geojson
            this._mapData = data;
            // reset file extension
            this._fileExtension = '.geojson';
          }
          else if (data['type'] === 'Topology') {
            // convert topology to geojson feature collection
            const geoOjbects: any = Object.keys(data.objects)[0];
            const geoData = topojson.feature(data, geoOjbects);
            this._mapData = geoData;
            this.createGeoJsonFile(this._mapData);
            // reset file extension
            this._fileExtension = '.topojson';
          }
          else {
            // assume map config
            this._mapConfig = data;
          }
          this.refreshMapView();
          break;
      }
    }
    catch (error) {
      this._logger.debug('refresh():', error.message);
      this.webview.postMessage({error: error});
    }
  } // end of refreshView()

  /**
   * Creates geojson data file, if it doesn't exist.
   * @param geoJsonData Geo json data object to save.
   */
  private createGeoJsonFile(geoJsonData: any) {
    const geoJsonFilePath: string = this._uri.fsPath.replace(this._fileExtension, '.geojson');
    if (!this._isRemoteData && this.createGeoJson && !fs.existsSync(geoJsonFilePath)) {
      fileUtils.createJsonFile(geoJsonFilePath, geoJsonData);
    }
  }

  /**
   * Refreshes map view with loaded geo data.
   */
  private refreshMapView() {
    // update map view
    this.webview.postMessage({
      command: 'refresh',
      fileName: this._fileName,
      uri: this._uri.toString(),
      mapConfig: this._mapConfig,
      mapStyle: this.mapStyle,
      mapData: this._mapData,
      dataType: this._fileExtension
    });
  }

   /**
   * Logs data stats and optional data schema or metadata for debug
   * and updates map view status bar item.
   * @param dataRows Data rows array.
   * @param dataSchema Optional data schema or metadata for debug logging.
   */
  private logDataStats(dataRows: Array<any>, dataSchema: any = null): void {
    // get data file size in bytes
    this._fileSize = fileUtils.getFileSize(this._uri.fsPath); //this._dataUrl);
    this._rowCount = dataRows.length;
    // this.updateStats(this._columns, this._rowCount);
    if (dataRows.length > 0 && dataRows.constructor !== Uint8Array) {
      const firstRow = dataRows[0];
      this._logger.debug('logDataStats(): 1st row:', firstRow);
      this._logger.debug('logDataStats(): rowCount:', this._rowCount);
    }
  }

  /**
   * Saves posted data from map view.
   * @param mapData Map data to save.
   * @param fileType Data file type.
   */
  private async saveData(mapData: any, fileType: string): Promise<void> {
    let dataFileName: string = this._fileName.substring(0, this._fileName.lastIndexOf('.')); // - .ext
    // add requested data file extension
    dataFileName += fileType;

    // create full data file path for saving data
    let dataFilePath: string = path.dirname(this._uri.fsPath);
    const workspaceFolders: readonly WorkspaceFolder[] | undefined = workspace.workspaceFolders;
    if (this._isRemoteData && workspaceFolders && workspaceFolders.length > 0) {
      // use 'rootPath' workspace folder for saving remote data file
      dataFilePath = workspaceFolders[0].uri.fsPath;
    }
    dataFilePath = path.join(dataFilePath, dataFileName);
    this._logger.debug('saveData(): saving data file:', dataFilePath);

    // display save file dialog
    const dataFileUri: Uri | undefined = await window.showSaveDialog({
      defaultUri: Uri.file(dataFilePath)
    });

    if (dataFileUri) {
      // create file data to save
      let fileData = mapData;
      let fileEncoding = null; // 'utf8'
      switch (fileType) {
        case '.kgl.html':
          fileData = config.mapDataToHtml(mapData);
          break;
        case '.png':
          fileData = mapData.replace('data:image/png;base64,', '');
          fileEncoding = 'base64';
          break;
        default: // .kgl.json map config, or .json map data
          fileData = JSON.stringify(mapData, null, 2);
          break;
      }

      // write map data to disk
      fs.writeFile(dataFileUri.fsPath, fileData, {encoding: fileEncoding}, (error) => {
        if (error) {
          this._logger.error(`saveData(): Error saving '${dataFileUri.fsPath}'. \n\t Error:`, error.message);
          window.showErrorMessage(`Unable to save data file: '${dataFileUri.fsPath}'. \n\t Error: ${error.message}`);
        }
        else { // if (this.openSavedFileEditor) {
          // open saved data file
          this.loadView('vscode.open', dataFileUri.with({scheme: 'file'}).toString(false)); // skip encoding
        }
      });
    }
  } // end of saveData()

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

  /**
   * Gets UI theme to use for the Map View display from workspace config.
   * see package.json 'configuration' section for more info.
   */
  get theme(): string {
    const uiTheme: string = <string>workspace.getConfiguration('geo.data.viewer').get('theme');
    return (uiTheme === 'dark' ? '': uiTheme); // default: dark
  }

  /**
   * Gets deafult map style to use for the Map View display from workspace config.
   * see package.json 'configuration' section for more info.
   */
  get mapStyle(): string {
    return <string>workspace.getConfiguration('geo.data.viewer').get('map.style');
  }

  /**
   * Create geojson data file when loading topojson, kml, gpx or shapefiles.
   */
  get createGeoJson(): boolean {
    return <boolean>workspace.getConfiguration('geo.data.viewer').get('create.geojson');
  }

}
