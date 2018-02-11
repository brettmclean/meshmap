var LogEntry = require("./LogEntry");

var LOG_LEVEL_ERROR = "error";
var LOG_LEVEL_WARN = "warn";
var LOG_LEVEL_INFO = "info";
var LOG_LEVEL_DEBUG = "debug";
var LOG_LEVEL_TRACE = "trace";

var LOG_LEVELS = {
	"error": 100,
	"warn": 200,
	"info": 300,
	"debug": 400,
	"trace": 500
};

var LoggingService = function(deps) {
	this._consoleLogProvider = deps.consoleLogProvider;

	this._logLevel = LOG_LEVEL_INFO;
};

LoggingService.prototype.init = function(loggingConfig) {
	this.setConfig(loggingConfig);
};

LoggingService.prototype.setConfig = function(loggingConfig) {
	if(this._isValidLogLevel(loggingConfig.level)) {
		this._logLevel = loggingConfig.level;
	}
};

LoggingService.prototype.error = function(message) {
	this._log(LOG_LEVEL_ERROR, message);
};

LoggingService.prototype.warn = function(message) {
	this._log(LOG_LEVEL_WARN, message);
};

LoggingService.prototype.info = function(message) {
	this._log(LOG_LEVEL_INFO, message);
};

LoggingService.prototype.debug = function(message) {
	this._log(LOG_LEVEL_DEBUG, message);
};

LoggingService.prototype.trace = function(message) {
	this._log(LOG_LEVEL_TRACE, message);
};

LoggingService.prototype.shutdown = function() {

};

LoggingService.prototype._log = function(level, message) {
	var logEntry = new LogEntry(level, message);
	if(this._shouldLogAtLevel(level)) {
		this._logToProvider(this._consoleLogProvider, logEntry);
	}
};

LoggingService.prototype._shouldLogAtLevel = function(level) {
	return LOG_LEVELS[level] <= LOG_LEVELS[this._logLevel];
};

LoggingService.prototype._isValidLogLevel = function(level) {
	return !!LOG_LEVELS[level];
};

LoggingService.prototype._logToProvider = function(logProvider, logEntry) {
	switch(logEntry.level) {
		case LOG_LEVEL_ERROR:
			logProvider.error(logEntry);
			break;
		case LOG_LEVEL_WARN:
			logProvider.warn(logEntry);
			break;
		case LOG_LEVEL_INFO:
			logProvider.info(logEntry);
			break;
		case LOG_LEVEL_DEBUG:
			logProvider.debug(logEntry);
			break;
		case LOG_LEVEL_TRACE:
			logProvider.trace(logEntry);
			break;
	}
};

module.exports = LoggingService;
