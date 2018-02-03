var TimestampFormatService = function() {

};

TimestampFormatService.prototype.formatAsIso8601UtcTimestamp = function(date) {
	return date.toISOString();
};

TimestampFormatService.prototype.formatAsIso8601UtcDate = function(date) {
	var isoString = date.toISOString();

	var tIdx = isoString.indexOf("T");
	return isoString.substring(0, tIdx);
};

module.exports = TimestampFormatService;
