// create keplerGL redux reducer
const reducers = (function createReducers(redux, keplerGl) {
  return redux.combineReducers({
    // mount keplerGl reducer
    keplerGl: keplerGl.keplerGlReducer.initialState({
      uiState: {
        readOnly: false
      }
    })
  });
})(Redux, KeplerGl);

// add keplerGL middlewares
const middleWares = (function createMiddlewares(keplerGl) {
  return keplerGl.enhanceReduxMiddleware([
    // add other middlewares here
  ]);
})(KeplerGl);

// create redux enhancers
const enhancers = (function createEnhancers(redux, middles) {
  return redux.applyMiddleware(...middles);
})(Redux, middleWares);

// create redux store
const store = (function createStore(redux, enhancers) {
  const initialState = {};
  return redux.createStore(reducers, initialState, redux.compose(enhancers));
})(Redux, enhancers);

// create kepler.gl map components
let KeplerElement = (function makeKeplerElement(react, keplerGl, mapboxToken) {
  // create kepler.gl app
  return function App() {
    var rootElm = react.useRef(null);
    var _useState = react.useState({
      width: window.innerWidth,
      height: window.innerHeight
    });
    var windowDimension = _useState[0];
    var setDimension = _useState[1];
    react.useEffect(function sideEffect() {
      function handleResize() {
        setDimension({ width: window.innerWidth, height: window.innerHeight });
      }
      window.addEventListener('resize', handleResize);
      return function() {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
    return react.createElement('div', {
        style: {
          position: 'absolute',
          left: 0,
          width: '100vw',
          height: '100vh'
        }
      },
      react.createElement(keplerGl.KeplerGl, {
        mapboxApiAccessToken: mapboxToken,
        id: 'map',
        width: windowDimension.width,
        height: windowDimension.height
      })
    );
  };
})(React, KeplerGl, MAPBOX_TOKEN);

// create kepler.gl map app
const app = (function createReactReduxProvider(
  react,
  reactRedux,
  KeplerElement
) {
  return react.createElement(
    reactRedux.Provider,
    { store },
    react.createElement(KeplerElement, null)
  );
})(React, ReactRedux, KeplerElement);

// render kepler.gl map app
(function render(react, reactDOM, app) {
  reactDOM.render(app, document.getElementById('app'));
  console.log('rendering map...');
})(React, ReactDOM, app);

// load map data and config from webview
let vscode, title, message,
  dataUrlInput, saveFileTypeSelector,
  map, mapConfig = {}, mapData = [],
  dataUrl, dataFileName, dataType;

// initialize vs code api for messaging
vscode = acquireVsCodeApi();

// wire document load state changes
document.addEventListener('readystatechange', event => {
	switch (document.readyState) {
		case 'loading':
			console.log(`loading: data url: ${dataUrl}`);
		break;
		case 'interactive':
			// document loading finished, images and stylesheets are still loading ...
			console.log('interactive!');
			// get initial data info: document url, views, etc.
			//vscode.postMessage({command: 'getDataInfo'});
			break;
		case "complete":
			// web page is fully loaded
			console.log('document.readystatechange complete: map.view:complete!');
			break;
	}      
});

document.addEventListener('DOMContentLoaded', event => {
  // initialize page elements
  title = document.getElementById('title');
  message = document.getElementById('message');
  dataUrlInput = document.getElementById('data-url-input');
  saveFileTypeSelector = document.getElementById('save-file-type-selector');  
  map = document.getElementById('map');
  try {
    // notify webview
    vscode.postMessage({command: 'refresh'});
    console.log('loading data ...');
  } catch (error) {
    // ignore: must be loaded outside of vscode webview
  }
});

// map config/data update handler
window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'showMessage':
      showMessage(event.data.message);
      break;
    case 'refresh':
      // clear loading map view message
      showMessage('');
      console.log('refreshing map view ...');
      vscode.setState({ uri: event.data.uri });
      title.innerText = event.data.fileName;
      dataFileName = event.data.fileName;
      dataUrl = event.data.uri;
      mapConfig = event.data.mapConfig;
      mapData = event.data.mapData;
      dataType = event.data.dataType;
      view(mapConfig, mapData);
      break;
  }
});

// map view update
function view(mapConfig, mapData, dataType) {
  try {
    // load data into keplergl map
    initializeMap(KeplerGl, store, mapConfig, mapData, dataType);
  } catch (error) {
    console.error('map.view:error: ', error.message);
    showMessage(error.message);
  }
}

function initializeMap(keplerGl, store, config, data, dataType) {
  console.log('initializing map ...');
  switch (dataType) {
    case '.csv':
      data = KeplerGl.processCsvData(data);
      break;
    case '.geojson':
      // TODO: KeplerGl.processGeoJson
      break;
  }
  
  // load map data
  const loadedData = keplerGl.KeplerGlSchema.load(data, config);
  store.dispatch(keplerGl.addDataToMap({
    datasets: loadedData.datasets,
    config: loadedData.config,
    options: {
      centerMap: false
    }
  }));
}

// save map data
function saveData() {
  // get requested file type
  const dataFileType = saveFileTypeSelector.value;
  // get keplergl map info with visState, mapState, mapStyle and uiState
  const mapInfo = store.getState().keplerGl.map;
  // get corresponding map data
  let mapData = {};
	switch (dataFileType) {
    case '.kgl.json':
      // get keplergl map config
      mapData = KeplerGl.KeplerGlSchema.getConfigToSave(mapInfo);
      postMapData('saveData', mapData, dataFileType);
      break;
    case '.csv':
      // TODO
      break;
    case '.json':
      // get keplergl map data
      mapData = KeplerGl.KeplerGlSchema.getDatasetToSave(mapInfo);
      postMapData('saveData', mapData, dataFileType);
      break;
    case '.map.json':
      mapData = {
        "config": KeplerGl.KeplerGlSchema.getConfigToSave(mapInfo),
        "datasets": KeplerGl.KeplerGlSchema.getDatasetToSave(mapInfo),
        "info": {
          "app": "GeoDataViewer",
          "created_at": new Date(Date.now()).toUTCString()
        }
      }
      postMapData('saveData', mapData, dataFileType);
      break;
    case '.geojson':
      // TODO
      break;
    case '.kgl.html': // keplergl html
      // create html map data
      mapData = {
        ...KeplerGl.KeplerGlSchema.save(mapInfo),
        mapboxApiAccessToken: MAPBOX_TOKEN,
        mode: 'EDIT'
      };
      postMapData('saveData', mapData, dataFileType);
      break;
    case '.png':
      const mapNode = document.getElementById('kepler-gl__map');
      domtoimage.toPng(mapNode).then(dataUrl => {
        postMapData('saveData', dataUrl, dataFileType);
      })
      //.catch(error => showMessage(error.message));
      break;
  }
} // end of saveData()

// posts map data for saving
function postMapData(command, mapData, dataFileType) {
  vscode.postMessage({
    command: command,
    data: mapData,
    fileType: dataFileType
  });
}

// view raw map source code
function viewMapSource() {
  vscode.postMessage({
    command: 'loadView',
    viewName: 'vscode.open',
    uri: dataUrl
  });
}

// launch map view for url
function loadMapViewFromUrl(e) {
  if (!e) e = window.event;
  const keyCode = e.keyCode || e.which;
  if (keyCode == '13') { // enter key
    const url = dataUrlInput.value;
    vscode.postMessage({
      command: 'loadView',
      viewName: 'map.view',
      uri: url
    });
  }
}

// open geo data file
function openGeoDataFile() {
  vscode.postMessage({command: 'openGeoDataFile'});
}

// show help page
function showHelp() {
  vscode.postMessage({
    command: 'loadView',
    viewName: 'vscode.open',
    uri: 'https://github.com/RandomFractals/geo-data-viewer#usage'
  });
}

// show buy coffee page :)
function buyCoffee() {
  vscode.postMessage({
    command: 'loadView',
    viewName: 'vscode.open',
    uri: 'https://ko-fi.com/datapixy'
  });
}

function showMessage(text) {
  message.innerText = text;
}
