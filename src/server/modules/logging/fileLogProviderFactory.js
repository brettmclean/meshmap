var FileLogProvider = require("./FileLogProvider");
var FileWriteService = require("../utils/FileWriteService");

var create = function(logDirectory) {
	var deps = {
		fileWriteService: new FileWriteService()
	};

	return new FileLogProvider(deps, logDirectory);
};

module.exports.create = create;
