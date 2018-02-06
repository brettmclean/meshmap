var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var ConsoleLogProvider = function(deps) {
	this._consoleOutputService = deps.consoleOutputService;
};
ConsoleLogProvider.prototype = Object.create(baseProto);
ConsoleLogProvider.prototype.constructor = ConsoleLogProvider;

ConsoleLogProvider.prototype.error = function(logEntry) {
	this._consoleOutputService.error(logEntry.message);
};
ConsoleLogProvider.prototype.warn = function(logEntry) {
	this._consoleOutputService.warn(logEntry.message);
};
ConsoleLogProvider.prototype.info = function(logEntry) {
	this._consoleOutputService.info(logEntry.message);
};
ConsoleLogProvider.prototype.debug = function(logEntry) {
	this._consoleOutputService.debug(logEntry.message);
};
ConsoleLogProvider.prototype.trace = function(logEntry) {
	this._consoleOutputService.debug(logEntry.message);
};

module.exports = ConsoleLogProvider;
