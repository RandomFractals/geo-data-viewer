"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
// log level setting for prod. vs. dev run of this ext.
exports.logLevel = logger_1.LogLevel.Info; // change to .Debug for ext. dev debug
exports.supportedDataFiles = /.*\.(csv|json|geojson)/;
exports.mapboxToken = 'pk.eyJ1IjoidWJlcmRhdGEiLCJhIjoiY2p5aHB5bzEzMDI3MjNucWx4dmhvbW5wYyJ9.ZjLMWjog4imdrZhtheCOtA';
//# sourceMappingURL=config.js.map