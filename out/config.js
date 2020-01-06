"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
// log level setting for prod. vs. dev run of this ext.
exports.logLevel = logger_1.LogLevel.Info; // change to .Debug for ext. dev debug
exports.supportedDataFiles = /.*\.(csv|json|geojson)/;
exports.mapboxToken = 'pk.eyJ1IjoiZGF0YXBpeHkiLCJhIjoiY2s1Mm10bHB1MThnbDNrdGVmemptd3J5eSJ9.xewq9dOWQLemerED1-qPXQ';
//# sourceMappingURL=config.js.map