var path = require("path");

var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var FileLogProvider = function(deps) {
	this._fileLogLocationService = deps.fileLogLocationService;
	this._fileWriteService = deps.fileWriteService;

	this._logDirectory = null;
	this._writingToLog = false;
	this._unwrittenBuffer = "";
};
FileLogProvider.prototype = Object.create(baseProto);
FileLogProvider.prototype.constructor = FileLogProvider;

FileLogProvider.prototype.init = function() {
	this._logDirectory = this._fileLogLocationService.getAbsoluteLogDirectory();
	this._fileWriteService.ensureDirectoryExists(this._logDirectory);
};
FileLogProvider.prototype.error = function(message) {
	logMessageToFile.call(this, message);
};
FileLogProvider.prototype.warn = function(message) {
	logMessageToFile.call(this, message);
};
FileLogProvider.prototype.info = function(message) {
	logMessageToFile.call(this, message);
};
FileLogProvider.prototype.debug = function(message) {
	logMessageToFile.call(this, message);
};
FileLogProvider.prototype.trace = function(message) {
	logMessageToFile.call(this, message);
};

var logMessageToFile = function(message) {
	this._unwrittenBuffer += message;
	if(this._writingToLog) {
		return;
	}

	var filename = this._fileLogLocationService.getLogFilename();
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
