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
const enhancers = (function craeteEnhancers(redux, middles) {
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
})(React, ReactDOM, app);

// TODO: customize map and load map data and config from webview
let vscode, title, message, map, mapConfig,
  saveFileTypeSelector, dataUrlInput,
  dataUrl, dataFileName;

document.addEventListener('DOMContentLoaded', event => {
  // initialize page elements
  title = document.getElementById('title');
  message = document.getElementById('message');
  dataUrlInput = document.getElementById('data-url-input');
  saveFileTypeSelector = document.getElementById('save-file-type-selector');  
  map = document.getElementById('map');
  try {
    // notify webview
    vscode = acquireVsCodeApi();
    vscode.postMessage({command: 'refresh'});
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
      try {
        vscode.setState({ uri: event.data.uri });
        mapConfig = event.data.config;
        title.innerText = event.data.fileName;
        dataUrl = event.data.uri;
        dataFileName = event.data.fileName;
        view(mapConfig);
      } catch (error) {
        console.error('map.view:', error.message);
        showMessage(error.message);
      }
      break;
  }
});

// map view update
function view(mapConfig) {
  showMessage(''); // 'Loading map view...';
  try {
    // TODO
  } catch (error) {
    console.error('map.view:', error.message);
    showMessage(error.message);
  }
}

// save map data
function saveData() {
  const dataFileType = saveFileTypeSelector.value;
	switch (dataFileType) {
    case '.kgl.json':
      // save keplergl map config
      const mapConfig = KeplerGl.KeplerGlSchema.getConfigToSave(store.getState().keplerGl.map);
      vscode.postMessage({
        command:'saveData',
        data: JSON.stringify(mapConfig, null, 2),
        fileType: dataFileType
      });
      break;
    case '.csv':
      // TODO
      break;
    case '.json':
      // save keplergl map data
      const mapData = KeplerGl.KeplerGlSchema.getDatasetToSave(store.getState().keplerGl.map);
      vscode.postMessage({
        command:'saveData',
        data: JSON.stringify(mapData, null, 2),
        fileType: dataFileType
      });
      break;
    case '.geojson':
      // TODO
      break;
    case '.html':
      // TODO
      break;
    case '.png':
      // TODO
      break;
  }
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
