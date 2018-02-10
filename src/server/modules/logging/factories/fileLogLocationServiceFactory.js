var FileLogLocationService = require("../FileLogLocationService");
var DateService = require("../../utils/DateService");
var TimestampFormatService = require("../TimestampFormatService");

var create = function(logDirectoryConfig) {
	var deps = {
		dateService: new DateService(),
		timestampFormatService: new TimestampFormatService()
	};

	return new FileLogLocationService(deps, logDirectoryConfig);
};

module.exports.create = create;
