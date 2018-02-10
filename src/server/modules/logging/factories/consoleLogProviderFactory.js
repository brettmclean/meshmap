var ConsoleLogProvider = require("../ConsoleLogProvider");
var ConsoleOutputService = require("../../utils/ConsoleOutputService");
var textLineLogEntryFormatterFactory = require("./textLineLogEntryFormatterFactory");

var create = function() {
	var deps = {
		textLineLogEntryFormatter: textLineLogEntryFormatterFactory.create(),
		consoleOutputService: new ConsoleOutputService()
	};
	return new ConsoleLogProvider(deps);
};

module.exports.create = create;
