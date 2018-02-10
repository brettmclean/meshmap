var TextLineLogEntryFormatter = require("../TextLineLogEntryFormatter");
var DateService = require("../../utils/DateService");
var TimestampFormatService = require("../TimestampFormatService");

var create = function() {
	var deps = {
		dateService: new DateService(),
		timestampFormatService: new TimestampFormatService()
	};

	return new TextLineLogEntryFormatter(deps);
};

module.exports.create = create;
