var FileLogProvider = require("../FileLogProvider");
var FileWriteService = require("../../utils/FileWriteService");
var textLineLogEntryFormatterFactory = require("./textLineLogEntryFormatterFactory");
var fileLogLocationServiceFactory = require("./fileLogLocationServiceFactory");

var create = function(logDirectoryConfig) {
	var deps = {
		textLineLogEntryFormatter: textLineLogEntryFormatterFactory.create(),
		fileLogLocationService: fileLogLocationServiceFactory.create(logDirectoryConfig),
		fileWriteService: new FileWriteService()
	};

	return new FileLogProvider(deps);
};

module.exports.create = create;
