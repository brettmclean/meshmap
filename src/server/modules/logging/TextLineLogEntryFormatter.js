var TextLineLogEntryFormatter = function(deps) {
	this._dateService = deps.dateService;
	this._timestampFormatService = deps.timestampFormatService;
};

TextLineLogEntryFormatter.prototype.format = function() {
	var currentDate = this._dateService.getCurrentDate();
	this._timestampFormatService.formatAsIso8601UtcTimestamp(currentDate);
};

module.exports = TextLineLogEntryFormatter;
