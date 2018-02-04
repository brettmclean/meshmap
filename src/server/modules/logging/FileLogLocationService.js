var path = require("path");

var FileLogLocationService = function(deps, logDirectoryConfig) {
	this._logDirectoryConfig = logDirectoryConfig;
};

FileLogLocationService.prototype.getAbsoluteLogDirectory = function() {
	if(path.isAbsolute(this._logDirectoryConfig)) {
		return this._logDirectoryConfig;
	}

	return path.resolve(__dirname, "../../", this._logDirectoryConfig);
};

FileLogLocationService.prototype.getLogFilename = function() {

};

module.exports = FileLogLocationService;
