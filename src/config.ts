import { LogLevel } from "./logger";

// log level setting for prod. vs. dev run of this ext.
export const logLevel: LogLevel = LogLevel.Info; // change to .Debug for ext. dev debug

export const supportedDataFiles: RegExp = /.*\.(csv|json|geojson)/;

export const mapboxToken: string = 'pk.eyJ1IjoiZGF0YXBpeHkiLCJhIjoiY2s1Mm10bHB1MThnbDNrdGVmemptd3J5eSJ9.xewq9dOWQLemerED1-qPXQ';
