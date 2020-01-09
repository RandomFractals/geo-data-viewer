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
  // create logo
  let LogoSvg = function LogoSvg() {
    return react.createElement("div", {
      className: "logo",
      style: { position: "fixed", zIndex: 10000, padding: "4px" }
    });
  };

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
      window.addEventListener("resize", handleResize);
      return function() {
        window.removeEventListener("resize", handleResize);
      };
    }, []);
    return react.createElement(
      "div",
      {
        style: {
          position: "absolute",
          left: 0,
          width: "100vw",
          height: "100vh"
        }
      },
      react.createElement(keplerGl.KeplerGl, {
        mapboxApiAccessToken: mapboxToken,
        id: "map",
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
  reactDOM.render(app, document.getElementById("app"));
})(React, ReactDOM, app);

// TODO: customize map and load map data and config from webview
let vscode, message, map, mapConfig;
document.addEventListener("DOMContentLoaded", event => {
  // initialize page elements
  message = document.getElementById("message");
  map = document.getElementById("map");
  try {
    // notify webview
    vscode = acquireVsCodeApi();
    vscode.postMessage({ command: "refresh" });
  } catch (error) {
    // ignore: must be loaded outside of vscode webview
  }
});

// map config/data update handler
window.addEventListener("message", event => {
  switch (event.data.command) {
    case "showMessage":
      showMessage(event.data.message);
      break;
    case "refresh":
      try {
        vscode.setState({ uri: event.data.uri });
        mapConfig = event.data.config;
        view(mapConfig);
      } catch (error) {
        console.error("map.view:", error.message);
        showMessage(error.message);
      }
      break;
  }
});

// map view update
function view(mapConfig) {
  showMessage(""); // 'Loading map view...';
  try {
    // TODO
  } catch (error) {
    console.error("map.view:", error.message);
    showMessage(error.message);
  }
}

function showHelp() {
  vscode.postMessage({ command: "showHelp" });
}

function showMessage(text) {
  message.innerText = text;
}
