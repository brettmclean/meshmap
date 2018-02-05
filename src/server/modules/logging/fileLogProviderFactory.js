var FileLogProvider = require("./FileLogProvider");
var FileWriteService = require("../utils/FileWriteService");
var fileLogLocationServiceFactory = require("./fileLogLocationServiceFactory");

var create = function(logDirectoryConfig) {
	var deps = {
		fileLogLocationService: fileLogLocationServiceFactory.create(logDirectoryConfig),
		fileWriteService: new FileWriteService()
	};

	return new FileLogProvider(deps);
};

module.exports.create = create;
