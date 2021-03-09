// create redux reducers
const reducers = (function createReducers(redux, keplerGl) {
  // mount keplergl reducer
  return redux.combineReducers({
    keplerGl: keplerGl.keplerGlReducer.initialState({
      uiState: {
        readOnly: false,
        currentModal: null
      }
    })
  });
})(Redux, KeplerGl);

// create redux middlewares
const middleWares = (function createMiddlewares(keplerGl) {
  return keplerGl.enhanceReduxMiddleware([
    // add middlewares here
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

// create keplergl app components
let KeplerElement = (function makeKeplerElement(react, keplerGl, mapboxToken) {
  // create keplergl app
  return function App() {
    const rootElm = react.useRef(null);
    
    // set window dimensions state
    const windowState = react.useState({
      width: window.innerWidth,
      height: window.innerHeight
    });
    const windowDimension = windowState[0];
    const setDimension = windowState[1];

    // add window resize event handler
    react.useEffect(function sideEffect() {
      function handleResize() {
        setDimension({ width: window.innerWidth, height: window.innerHeight });
      }
      window.addEventListener('resize', handleResize);
      return function() {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    // create default map styles
    const mapStyles = createMapStyles(mapboxToken);

    // create keplergl app element
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
        height: windowDimension.height,
        theme: THEME,
        mapStyles: mapStyles
      })
    );
  };
})(React, KeplerGl, MAPBOX_TOKEN);

// create keplergl map app
const app = (function createReactReduxProvider(react, reactRedux, KeplerElement) {
  return react.createElement(reactRedux.Provider, {store},
    react.createElement(KeplerElement, null)
  );
})(React, ReactRedux, KeplerElement);

// render keplergl map app
(function render(react, reactDOM, app) {
  reactDOM.render(app, document.getElementById('app'));
  console.log('rendering map...');
})(React, ReactDOM, app);

// load map data and config from webview
let vscode, title, message,
  dataUrlInput, saveFileTypeSelector,
  map, mapStyle, mapConfig = {}, mapData = [],
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
      // title.innerText = event.data.fileName;
      dataFileName = event.data.fileName;
      dataUrl = event.data.uri;
      mapConfig = event.data.mapConfig;
      mapStyle = event.data.mapStyle;
      mapData = event.data.mapData;
      dataType = event.data.dataType;
      view(mapConfig, mapData, dataType);
      break;
  }
});

// map view update
function view(mapConfig, mapData, dataType) {
  try {
    // load data into keplergl map
    initializeMap(KeplerGl, store, mapConfig, mapData, dataType);
  } catch (error) {
    console.error(`map.view:error: ${error}`);
    showMessage(error.message);
  }
}

function initializeMap(keplerGl, store, config, data, dataType) {
  console.log(`initializeMap: loading ${dataType} data ...`);
  let dataSets = {};
  let dataConfig = config;
  let tagData = false;
  let geoDataFeatures;
  const geoJsonFormat = new ol.format.GeoJSON();
  switch (dataType) {
    case '.csv':
      data = KeplerGl.processCsvData(data);
      tagData = true;
      break;
    case '.igc':
      // read IGC data
      const igcFormat = new ol.format.IGC();
      const igcFeatures = igcFormat.readFeatures(data, {
        // dataProjection: 'EPSG:4326',
        // featureProjection: 'EPSG:3857'
      });
      geoDataFeatures = geoJsonFormat.writeFeatures(igcFeatures);
      data = JSON.parse(geoDataFeatures);
      data = KeplerGl.processGeojson(data);
      tagData = true;
      break;
    case '.gml':
      // read GML data
      const gmlFormat = new ol.format.GML32();
      const gmlFeatures = gmlFormat.readFeatures(data, {});
      geoDataFeatures = geoJsonFormat.writeFeatures(gmlFeatures);
      data = JSON.parse(geoDataFeatures);
      data = KeplerGl.processGeojson(data);
      tagData = true;
      break;  
    case '.wkt':
      // read WKT data
      const wktFormat = new ol.format.WKT();
      const wktFeatures = wktFormat.readFeatures(data, {});
      geoDataFeatures = geoJsonFormat.writeFeatures(wktFeatures);
      data = JSON.parse(geoDataFeatures);
      data = KeplerGl.processGeojson(data);
      tagData = true;
      break;
    case 'geo.json':
    case '.geojson':
    case '.gpx':
    case '.kml':
    case '.shp':
    case '.fgb':
    case '.topo.json':
    case '.topojson':    
      // convert geojson data to keplergl geo data
      data = KeplerGl.processGeojson(data);
      tagData = true;
      break;
    case '.json':
      const loadedData = keplerGl.KeplerGlSchema.load(data, config);
      dataSets = loadedData.datasets;
      dataConfig = loadedData.config;
      break;
  }

  if (tagData) {
    // create dataset with processed data and info tag
    dataSets = {
      data,
      info: {
        id: dataFileName
      }
    }
    // console.log(JSON.stringify(dataSets));
  }
  
  // load map data
  store.dispatch(keplerGl.addDataToMap({
    datasets: dataSets,
    config: dataConfig,
    options: {
      centerMap: true
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
          "app": "kepler.gl",
          "source": "GeoDataViewer",
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

// show map gallery
function showMapGallery() {
  vscode.postMessage({
    command: 'showMapGallery'
  });
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

// creates deafult map styles
function createMapStyles(mapboxToken) {
  const defaultLayerGroups = [];
  return [
    {
      id: 'dark_streets',
      label: 'Dark Streets',
      url: 'mapbox://styles/mapbox/dark-v10',
      icon: `https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/-87.623177,41.881832,9.19,0,0/400x300?access_token=${mapboxToken}&logo=false&attribution=false`,
      layerGroups: defaultLayerGroups
    }, 
    {
      id: 'light_streets',
      label: 'Light Streets',
      url: 'mapbox://styles/mapbox/light-v10',
      icon: `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-87.623177,41.881832,9.19,0,0/400x300?access_token=${mapboxToken}&logo=false&attribution=false`,
      layerGroups: defaultLayerGroups
    },
    /* { // note: looks same as outdoors
      id: 'streets',
      label: 'Streets',
      url: 'mapbox://styles/mapbox/streets-v10',
      icon: `https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/-87.623177,41.881832,9.19,0,0/400x300?access_token=${mapboxToken}&logo=false&attribution=false`,
      layerGroups: defaultLayerGroups
    }, */
    {
      id: 'outdoors',
      label: 'Outdoors',
      url: 'mapbox://styles/mapbox/outdoors-v10',
      icon: `https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/static/-87.623177,41.881832,9.19,0,0/400x300?access_token=${mapboxToken}&logo=false&attribution=false`,
      layerGroups: defaultLayerGroups
    },
    {
      id: 'satellite',
      label: 'Satellite',
      url: 'mapbox://styles/mapbox/satellite-v9',
      icon: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/-87.623177,41.881832,9.19,0,0/400x300?access_token=${mapboxToken}&logo=false&attribution=false`,
      layerGroups: defaultLayerGroups
    }
  ];
}
