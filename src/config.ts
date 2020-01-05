import { LogLevel } from "./logger";

// log level setting for prod. vs. dev run of this ext.
export const logLevel: LogLevel = LogLevel.Info; // change to .Debug for ext. dev debug

export const supportedDataFiles: RegExp = /.*\.(csv|json|geojson)/;

export const mapboxToken: string = 'pk.eyJ1IjoidWJlcmRhdGEiLCJhIjoiY2p5aHB5bzEzMDI3MjNucWx4dmhvbW5wYyJ9.ZjLMWjog4imdrZhtheCOtA';