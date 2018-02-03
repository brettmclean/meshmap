var TimestampFormatService = function() {

};

TimestampFormatService.prototype.formatDateAsIso8601UtcTimestamp = function(date) {
	return date.toISOString();
};

module.exports = TimestampFormatService;
