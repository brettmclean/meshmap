var path = require("path");

var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var FileLogProvider = function(deps, logDirectory) {
	this._fileWriteService = deps.fileWriteService;
	this._logDirectory = logDirectory;
};
FileLogProvider.prototype = Object.create(baseProto);
FileLogProvider.prototype.constructor = FileLogProvider;

FileLogProvider.prototype.init = function() {
	this._fileWriteService.ensureDirectoryExists(this._logDirectory);
};
FileLogProvider.prototype.error = function(filename, message) {
	logMessageToFile.call(this, filename, message);
};
FileLogProvider.prototype.warn = function(filename, message) {
	logMessageToFile.call(this, filename, message);
};
FileLogProvider.prototype.info = function(filename, message) {
	logMessageToFile.call(this, filename, message);
};
FileLogProvider.prototype.debug = function(filename, message) {
	logMessageToFile.call(this, filename, message);
};
FileLogProvider.prototype.trace = function(filename, message) {
	logMessageToFile.call(this, filename, message);
};

var logMessageToFile = function(filename, message) {
	var logFilePath = path.join(this._logDirectory, filename);
	this._fileWriteService.appendUtf8StringToFile(logFilePath, message);
};

module.exports = FileLogProvider;
