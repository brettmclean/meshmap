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
	this._logBufferService = deps.logBufferService;

	this._logLevel = LOG_LEVEL_INFO;
	this._logToConsole = true;
	this._logProviders = [];

	this._logProvidersHaveBeenSet = false;
};

LoggingService.prototype.init = function(loggingConfig) {
	this.setConfig(loggingConfig);
};

LoggingService.prototype.setConfig = function(loggingConfig) {
	if(this._isValidLogLevel(loggingConfig.level)) {
		this._logLevel = loggingConfig.level;
	}
	this._logToConsole = loggingConfig.logToConsole;
};

LoggingService.prototype.setLogProviders = function(logProviders) {
	this._logProvidersHaveBeenSet = true;
	this._logProviders = logProviders;
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
	if(this._logBufferService.hasEntries()) {
		this._logBufferedEntriesToLogProviders();
	}
};

LoggingService.prototype._log = function(level, message) {
	var logEntry = new LogEntry(level, message);
	if(this._shouldLogAtLevel(level)) {
		this._logToConsoleLogProvider(logEntry);
		this._logBufferService.queueEntry(logEntry);
		this._logBufferedEntriesToLogProvidersIfSet();
	}
};

LoggingService.prototype._logToConsoleLogProvider = function(logEntry) {
	if(this._logToConsole) {
		this._logToProvider(this._consoleLogProvider, logEntry);
	}
};

LoggingService.prototype._logBufferedEntriesToLogProvidersIfSet = function() {
	if(this._logProvidersHaveBeenSet) {
		this._logBufferedEntriesToLogProviders();
	}
};

LoggingService.prototype._logBufferedEntriesToLogProviders = function() {
	var logEntries = this._logBufferService.dequeueAndClearEntries();
	this._logEntriesToDefinedLogProviders(logEntries);
};

LoggingService.prototype._logEntriesToDefinedLogProviders = function(logEntries) {
	for(var i = 0; i < logEntries.length; i++) {
		var logEntry = logEntries[i];
		this._logEntryToDefinedLogProviders(logEntry);
	}
};

LoggingService.prototype._logEntryToDefinedLogProviders = function(logEntry) {
	for(var i = 0; i < this._logProviders.length; i++) {
		var logProvider = this._logProviders[i];
		this._logToProvider(logProvider, logEntry);
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
