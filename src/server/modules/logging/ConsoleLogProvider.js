var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var ConsoleLogProvider = function(deps) {
	this._textLineLogEntryFormatter = deps.textLineLogEntryFormatter;
	this._consoleOutputService = deps.consoleOutputService;
};
ConsoleLogProvider.prototype = Object.create(baseProto);
ConsoleLogProvider.prototype.constructor = ConsoleLogProvider;

ConsoleLogProvider.prototype.error = function(logEntry) {
	var output = this._textLineLogEntryFormatter.format(logEntry);
	this._consoleOutputService.error(output);
};

ConsoleLogProvider.prototype.warn = function(logEntry) {
	var output = this._textLineLogEntryFormatter.format(logEntry);
	this._consoleOutputService.warn(output);
};

ConsoleLogProvider.prototype.info = function(logEntry) {
	var output = this._textLineLogEntryFormatter.format(logEntry);
	this._consoleOutputService.info(output);
};

ConsoleLogProvider.prototype.debug = function(logEntry) {
	var output = this._textLineLogEntryFormatter.format(logEntry);
	this._consoleOutputService.debug(output);
};

ConsoleLogProvider.prototype.trace = function(logEntry) {
	var output = this._textLineLogEntryFormatter.format(logEntry);
	this._consoleOutputService.debug(output);
};

module.exports = ConsoleLogProvider;
