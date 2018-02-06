var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var ConsoleLogProvider = function(deps) {
	this._consoleOutputService = deps.consoleOutputService;
};
ConsoleLogProvider.prototype = Object.create(baseProto);
ConsoleLogProvider.prototype.constructor = ConsoleLogProvider;

ConsoleLogProvider.prototype.error = function(message) {
	this._consoleOutputService.error(message);
};
ConsoleLogProvider.prototype.warn = function(message) {
	this._consoleOutputService.warn(message);
};
ConsoleLogProvider.prototype.info = function(message) {
	this._consoleOutputService.info(message);
};
ConsoleLogProvider.prototype.debug = function(message) {
	this._consoleOutputService.debug(message);
};
ConsoleLogProvider.prototype.trace = function(message) {
	this._consoleOutputService.debug(message);
};

module.exports = ConsoleLogProvider;
