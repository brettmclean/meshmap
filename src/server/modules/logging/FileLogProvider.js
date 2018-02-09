var path = require("path");
var os = require("os");

var LogProviderBase = require("./LogProviderBase");

var baseClass = LogProviderBase,
	baseProto = baseClass.prototype;

var FileLogProvider = function(deps) {
	this._textLineLogEntryFormatter = deps.textLineLogEntryFormatter;
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

FileLogProvider.prototype.error = function(logEntry) {
	var output = formatLogEntryWithNewLine.call(this, logEntry);
	logMessageToFile.call(this, output);
};

FileLogProvider.prototype.warn = function(logEntry) {
	var output = formatLogEntryWithNewLine.call(this, logEntry);
	logMessageToFile.call(this, output);
};

FileLogProvider.prototype.info = function(logEntry) {
	var output = formatLogEntryWithNewLine.call(this, logEntry);
	logMessageToFile.call(this, output);
};

FileLogProvider.prototype.debug = function(logEntry) {
	var output = formatLogEntryWithNewLine.call(this, logEntry);
	logMessageToFile.call(this, output);
};

FileLogProvider.prototype.trace = function(logEntry) {
	var output = formatLogEntryWithNewLine.call(this, logEntry);
	logMessageToFile.call(this, output);
};

var formatLogEntryWithNewLine = function(logEntry) {
	return this._textLineLogEntryFormatter.format(logEntry) + os.EOL;
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
