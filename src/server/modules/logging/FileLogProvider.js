var path = require("path");

var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var FileLogProvider = function(deps, logDirectory) {
	this._fileWriteService = deps.fileWriteService;
	this._logDirectory = logDirectory;

	this._writingToLog = false;
	this._unwrittenBuffer = "";
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
	this._unwrittenBuffer += message;
	if(this._writingToLog) {
		return;
	}

	var logFilePath = path.join(this._logDirectory, filename);
	flushUnwrittenBuffer.call(this, logFilePath);
};

var flushUnwrittenBuffer = function(logFilePath) {
	var data = this._unwrittenBuffer;
	this._unwrittenBuffer = "";

	this._writingToLog = true;
	this._fileWriteService.appendUtf8StringToFile(logFilePath, data, writeFinished.bind(this, logFilePath));
};

var writeFinished = function(logFilePath, err) {
	this._writingToLog = false;
	if(err) {
		throw err;
	}
	if(this._unwrittenBuffer) {
		flushUnwrittenBuffer.call(this, logFilePath);
	}
};

module.exports = FileLogProvider;
