"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// supported log levels
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Warn"] = 1] = "Warn";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
class Logger {
    /**
     * Creates new logger instance.
     * @param category Logger category, usually the source class name.
     * @param logLevel Log level to use or supress logging.
     */
    constructor(category, logLevel = LogLevel.Debug) {
        this.category = category;
        this.logLevel = logLevel;
    }
    /**
     * Logs new message.
     * @param logLevel Log message level.
     * @param message Log message.
     * @param params Log message params, if any.
     */
    logMessage(logLevel, message, params = '') {
        if (logLevel >= this.logLevel) {
            if (params) {
                this.log(logLevel, message, params);
            }
            else {
                this.log(logLevel, message);
            }
        }
    }
    /**
     * Logs new debug message.
     * @param message Debug log message.
     * @param params Debug log message params, if any.
     */
    debug(message, params = '') {
        if (this.logLevel <= LogLevel.Debug) {
            this.log(LogLevel.Debug, message, params);
        }
    }
    /**
     * Logs new info message.
     * @param message Info log message.
     * @param params Info log message params, if any.
     */
    info(message, params = '') {
        this.log(LogLevel.Info, message, params);
    }
    /**
     * Logs new error message.
     * @param message Error log message.
     * @param params Error log message params, if any.
     */
    error(message, params = '') {
        this.log(LogLevel.Error, message, params);
    }
    /**
     * Logs new message to console based on the specified log level.
     * @param logLevel Log message level.
     * @param message Log message.
     * @param params Log message params, if any.
     */
    log(logLevel, message, params = '') {
        if (typeof params === 'object') {
            params = JSON.stringify(params, null, 2);
        }
        switch (logLevel) {
            case LogLevel.Warn:
                console.warn(this.category + message, params);
                break;
            case LogLevel.Info:
                console.info(this.category + message, params);
                break;
            case LogLevel.Error:
                console.error(this.category + message, params);
                break;
            default: // debug
                console.log(this.category + message, params);
                break;
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map