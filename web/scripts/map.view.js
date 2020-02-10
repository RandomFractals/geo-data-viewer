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
  console.log('rendering map...');
})(React, ReactDOM, app);

// load map data and config from webview
let vscode, title, message,
  dataUrlInput, saveFileTypeSelector,
  map, mapConfig = {}, mapData = [],
  dataUrl, dataFileName;

  const datasets = [{"data":{"allData":[["Argentina",-38.416097,-63.616672,46,43,54,52],["AUSTRALIA",-25.274398,133.775136,9,10,7,34],["Austria",47.516231,14.550072,19,11,8,28],["Bahrain",25.930414,50.637772,48,17,19,1],["Belgium",50.503887,4.469936,29,42,39,32],["Brazil",-14.235004,-51.92528,42,57,64,62],["Cambodia",12.565679,104.990963,null,null,null,24],["Canada",56.130366,-106.346771,14,9,12,16],["Chile",-35.675147,-71.542969,36,44,45,51],["China",35.86166,104.195397,38,38,48,55],["Colombia",4.570868,-74.297333,27,33,20,8],["Costa Rica",9.748917,-83.753428,11,12,6,2],["Cyprus",35.126413,33.429859,39,52,35,33],["Czech Republic",49.817492,15.472962,17,22,10,11],["Denmark",56.26392,9.501785,32,39,50,30],["ECUADOR",-1.831239,-78.183406,1,1,3,25],["Egypt",26.820553,30.802498,52,null,62,null],["Finland",61.92411,25.748151,null,51,32,21],["France",46.227638,2.213749,40,47,41,38],["Germany",51.165691,10.451526,12,16,17,23],["Ghana",7.946527,-1.023194,57,null,null,null],["Greece",39.074208,21.824312,59,63,66,65],["HONG KONG",22.396428,114.109497,10,26,44,39],["Hungary",47.162494,19.503304,28,29,21,41],["India",20.593684,78.96288,55,55,49,57],["Indonesia",-0.789275,113.921327,20,32,52,53],["Ireland",53.41291,-8.24389,43,40,56,45],["Israel",31.046051,34.851612,50,36,36,44],["Italy",41.87194,12.56738,53,58,59,60],["Japan",36.204824,138.252924,47,28,29,40],["Kazakhstan",48.019573,66.923684,35,59,55,35],["Kenya",-0.023559,37.906193,37,41,46,37],["Kuwait",29.31166,47.481766,61,64,67,64],["LUXEMBOURG",49.815273,6.129583,2,5,9,14],["Malaysia",4.210484,101.975766,25,21,38,15],["Malta",35.937496,14.375416,null,3,2,7],["MEXICO",23.634501,-102.552784,3,2,4,3],["Morocco",31.791702,-7.09262,null,null,37,null],["Mozambique",-18.665695,35.529562,null,null,61,null],["Myanmar",21.913965,95.956223,null,48,null,48],["Netherlands",52.132633,5.291266,23,25,30,13],["New Zealand",-40.900557,174.885971,16,6,5,6],["Nigeria",9.081999,8.675277,56,62,65,63],["Norway",60.472024,8.468946,18,34,43,20],["Oman",21.512583,55.923255,30,24,22,17],["Panama",8.537981,-80.782127,24,8,15,36],["Peru",-9.189967,-75.015152,31,46,53,47],["PHILIPPINES",12.879721,121.774017,8,18,23,29],["Poland",51.919438,19.145136,15,15,24,49],["Portugal",39.399872,-8.224454,41,20,28,5],["Qatar",25.354826,51.183884,58,54,60,58],["Romania",45.943161,24.96676,null,27,16,19],["Russia",61.52401,105.318756,54,60,47,50],["Saudi Arabia",23.885942,45.079162,60,61,63,61],["Senegal",14.497401,-14.452362,45,null,null,null],["Singapore",1.352083,103.819836,6,4,13,9],["South Africa",-30.559482,22.937506,44,49,51,42],["South Korea",35.907757,127.766922,13,23,27,31],["SPAIN",40.463667,-3.74922,7,30,14,10],["Sweden",60.128161,18.643501,34,37,42,22],["Switzerland",46.818188,8.227512,4,14,31,27],["Taiwan",23.69781,120.960515,null,null,1,4],["Tanzania",-6.369028,34.888822,null,50,58,null],["Thailand",15.870032,100.992541,22,7,18,18],["Turkey",38.963745,35.243322,49,53,57,56],["UAE",23.424076,53.847818,33,19,40,26],["Uganda",1.373333,32.290275,51,45,25,46],["Ukraine",48.379433,31.16558,null,null,34,59],["United Kingdom",55.378051,-3.435973,21,31,33,54],["USA",37.09024,-95.712891,5,13,26,43],["Vietnam",14.058324,108.277199,26,35,11,12],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,null,null,null,null,null],[null,null,1,null,null,null,null],[null,null,10,null,null,null,null]],"color":[143,47,191],"fields":[{"analyzerType":"STRING","format":"","name":"Country","type":"string"},{"analyzerType":"FLOAT","format":"","name":"Latitude","type":"real"},{"analyzerType":"FLOAT","format":"","name":"Longitude","type":"real"},{"analyzerType":"INT","format":"","name":"2014","type":"integer"},{"analyzerType":"INT","format":"","name":"2015","type":"integer"},{"analyzerType":"INT","format":"","name":"2016","type":"integer"},{"analyzerType":"INT","format":"","name":"2017","type":"integer"}],"id":"vvzpce4kr","label":"Top Expat Destinations.csv"},"version":"v1"}];
  const config = {"config":{"mapState":{"bearing":0,"dragRotate":false,"isSplit":false,"latitude":10.5117765,"longitude":34.269600000000004,"pitch":0,"zoom":2},"mapStyle":{"mapStyles":{},"styleType":"muted_night","threeDBuildingColor":[9.665468314072013,17.18305478057247,31.1442867897876],"topLayerGroups":{},"visibleLayerGroups":{"border":true,"building":false,"label":true,"land":true,"road":false,"water":true}},"visState":{"animationConfig":{"currentTime":null,"speed":1},"filters":[],"interactionConfig":{"brush":{"enabled":false,"size":0.5},"coordinate":{"enabled":false},"tooltip":{"enabled":true,"fieldsToShow":{"vvzpce4kr":["Country","2014","2015","2016","2017"]}}},"layerBlending":"normal","layers":[{"config":{"color":[218,112,191],"columns":{"altitude":"2017","lat":"Latitude","lng":"Longitude"},"dataId":"vvzpce4kr","isVisible":true,"label":"2017","textLabel":[{"alignment":"center","anchor":"start","color":[255,255,255],"field":null,"offset":[0,0],"size":18}],"visConfig":{"colorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"filled":true,"fixedRadius":false,"opacity":1,"outline":false,"radius":20,"radiusRange":[0,50],"strokeColor":[218,112,191],"strokeColorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"thickness":2}},"id":"a6kif8","type":"point","visualChannels":{"colorField":{"name":"2017","type":"integer"},"colorScale":"quantize","sizeField":null,"sizeScale":"linear","strokeColorField":null,"strokeColorScale":"quantile"}},{"config":{"color":[241,92,23],"columns":{"altitude":"2016","lat":"Latitude","lng":"Longitude"},"dataId":"vvzpce4kr","isVisible":true,"label":"2016","textLabel":[{"alignment":"center","anchor":"start","color":[255,255,255],"field":null,"offset":[0,0],"size":18}],"visConfig":{"colorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"filled":true,"fixedRadius":false,"opacity":1,"outline":false,"radius":30,"radiusRange":[0,50],"strokeColor":[241,92,23],"strokeColorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"thickness":2}},"id":"2j8ln5g","type":"point","visualChannels":{"colorField":{"name":"2016","type":"integer"},"colorScale":"quantize","sizeField":null,"sizeScale":"linear","strokeColorField":null,"strokeColorScale":"quantile"}},{"config":{"color":[255,203,153],"columns":{"altitude":"2015","lat":"Latitude","lng":"Longitude"},"dataId":"vvzpce4kr","isVisible":true,"label":"2015","textLabel":[{"alignment":"center","anchor":"start","color":[255,255,255],"field":null,"offset":[0,0],"size":18}],"visConfig":{"colorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"filled":true,"fixedRadius":false,"opacity":1,"outline":false,"radius":40,"radiusRange":[0,50],"strokeColor":[255,203,153],"strokeColorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"thickness":2}},"id":"6rkgfob","type":"point","visualChannels":{"colorField":{"name":"2015","type":"integer"},"colorScale":"quantize","sizeField":null,"sizeScale":"linear","strokeColorField":null,"strokeColorScale":"quantile"}},{"config":{"color":[119,110,87],"columns":{"altitude":"2014","lat":"Latitude","lng":"Longitude"},"dataId":"vvzpce4kr","isVisible":true,"label":"2014","textLabel":[{"alignment":"center","anchor":"start","color":[255,255,255],"field":null,"offset":[0,0],"size":18}],"visConfig":{"colorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"filled":true,"fixedRadius":false,"opacity":1,"outline":false,"radius":50,"radiusRange":[0,50],"strokeColor":[119,110,87],"strokeColorRange":{"category":"Uber","colors":["#00939C","#5DBABF","#BAE1E2","#F8C0AA","#DD7755","#C22E00"],"name":"Uber Viz Diverging 1.5","reversed":false,"type":"diverging"},"thickness":2}},"id":"gj02nln","type":"point","visualChannels":{"colorField":{"name":"2017","type":"integer"},"colorScale":"quantize","sizeField":null,"sizeScale":"linear","strokeColorField":null,"strokeColorScale":"quantile"}}],"splitMaps":[]}},"version":"v1"};

//(
function initializeMap(keplerGl, store, config, data) {
  console.log('initializing map ...');
  const loadedData = keplerGl.KeplerGlSchema.load(data, config);
  store.dispatch(keplerGl.addDataToMap({
    datasets: loadedData.datasets,
    config: loadedData.config,
    options: {
      centerMap: false
    }
  }));
} //(KeplerGl, store, config, datasets));

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
			console.log('document.readystatechange complete\n\n map.view:complete!');
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
    vscode = acquireVsCodeApi();
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
      mapData = even.data.mapData;
      view(mapConfig, mapData);
      break;
  }
});

// map view update
function view(mapConfig, mapData) {
  try {
    // load data into keplergl map
    initializeMap(KeplerGl, store, config, datasets); //mapConfig, mapData);
  } catch (error) {
    console.error('map.view:error: ', error.message);
    showMessage(error.message);
  }
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
