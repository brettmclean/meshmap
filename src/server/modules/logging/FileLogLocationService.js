var path = require("path");

var FileLogLocationService = function(deps, logDirectoryConfig) {
	this._dateService = deps.dateService;
	this._timestampFormatService = deps.timestampFormatService;

	this._logDirectoryConfig = logDirectoryConfig;
};

FileLogLocationService.prototype.getAbsoluteLogDirectory = function() {
	if(!this._logDirectoryConfig) {
		return null;
	}

	if(path.isAbsolute(this._logDirectoryConfig)) {
		return this._logDirectoryConfig;
	}

	return path.resolve(__dirname, "../../", this._logDirectoryConfig);
};

FileLogLocationService.prototype.getLogFilename = function() {
	var currentDate = this._dateService.getCurrentDate();
	var dateString = this._timestampFormatService.formatAsIso8601UtcDate(currentDate);
	return dateString + ".log";
};

module.exports = FileLogLocationService;
