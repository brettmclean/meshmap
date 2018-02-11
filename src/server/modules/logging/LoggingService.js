var LogEntry = require("./LogEntry");

var LOG_LEVEL_INFO = "info";

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

LoggingService.prototype.info = function(message) {
	this._log(LOG_LEVEL_INFO, message);
};

LoggingService.prototype.shutdown = function() {

};

LoggingService.prototype._log = function(level, message) {
	var logEntry = new LogEntry(level, message);
	if(this._shouldLogAtLevel(level)) {
		this._consoleLogProvider.info(logEntry);
	}
};

LoggingService.prototype._shouldLogAtLevel = function(level) {
	return LOG_LEVELS[level] <= LOG_LEVELS[this._logLevel];
};

LoggingService.prototype._isValidLogLevel = function(level) {
	return !!LOG_LEVELS[level];
};

module.exports = LoggingService;
