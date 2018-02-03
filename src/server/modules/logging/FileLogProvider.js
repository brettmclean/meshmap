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

module.exports = FileLogProvider;
