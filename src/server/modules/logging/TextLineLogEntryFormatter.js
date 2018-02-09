var TextLineLogEntryFormatter = function(deps) {
	this._dateService = deps.dateService;
	this._timestampFormatService = deps.timestampFormatService;
};

TextLineLogEntryFormatter.prototype.format = function(logEntry) {
	var currentDate = this._dateService.getCurrentDate();
	var timestamp = this._timestampFormatService.formatAsIso8601UtcTimestamp(currentDate);
	var textline = `[${timestamp}] ${logEntry.level.toUpperCase()}: ${logEntry.message}`;

	return textline;
};

module.exports = TextLineLogEntryFormatter;
