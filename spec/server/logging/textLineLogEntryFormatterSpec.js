require("../testUtils/init");
var loader = require("../testUtils/loader");

var TextLineLogEntryFormatter = loader.load("logging/TextLineLogEntryFormatter");
var DateService = loader.load("utils/DateService");
var TimestampFormatService = loader.load("logging/TimestampFormatService");
var LogEntry = loader.load("logging/LogEntry");

var DEFAULT_LEVEL = "info";
var DEFAULT_MESSAGE = "Application starting...";
var DEFAULT_LOG_ENTRY = new LogEntry(DEFAULT_LEVEL, DEFAULT_MESSAGE);

describe("A text line log entry formatter", function() {

	describe("format method", function() {

		it("exists", function() {
			var tllef = createTextLineLogEntryFormatter();

			expect(typeof tllef.format).toBe("function");
		});

		it("calls getCurrentDate method on date service", function() {
			var ds = createDateService(),
				tllef = createTextLineLogEntryFormatter({ dateService: ds });

			tllef.format(DEFAULT_LOG_ENTRY);

			expect(ds.getCurrentDate).toHaveBeenCalled();
		});

		it("calls formatAsIso8601UtcTimestamp method on timestamp format service with date returned by date service", function() {
			var date = new Date(99999999999),
				ds = createDateServiceWhichReturnsCurrentDate(date),
				tfs = createTimestampFormatService(),
				tllef = createTextLineLogEntryFormatter({ dateService: ds, timestampFormatService: tfs });

			tllef.format(DEFAULT_LOG_ENTRY);

			expect(tfs.formatAsIso8601UtcTimestamp).toHaveBeenCalledWith(date);
		});

		it("returns a string containing the timestamp returned by the timestamp format service", function() {
			var timestampString = "2011-05-23T15:48:52.278Z",
				tfs = createTimestampFormatServiceWhichReturnsString(timestampString),
				tllef = createTextLineLogEntryFormatter({ timestampFormatService: tfs });

			var textLine = tllef.format(DEFAULT_LOG_ENTRY);

			expect(stringContainsString(textLine, timestampString)).toBe(true);
		});

		it("returns a string containing uppercase version of level in the given log entry", function() {
			var logEntry = new LogEntry("trace", "DoesNotMatter"),
				tllef = createTextLineLogEntryFormatter();

			var textLine = tllef.format(logEntry);

			expect(stringContainsString(textLine, "TRACE")).toBe(true);
		});

		it("returns a string containing the message in the given log entry", function() {
			var logEntry = new LogEntry("info", "My custom message"),
				tllef = createTextLineLogEntryFormatter();

			var textLine = tllef.format(logEntry);

			expect(stringContainsString(textLine, "My custom message")).toBe(true);
		});

	});

});

function createTextLineLogEntryFormatter(deps) {
	deps = deps || {};

	deps.dateService = deps.dateService || createDateService();
	deps.timestampFormatService = deps.timestampFormatService || createTimestampFormatService();

	return new TextLineLogEntryFormatter(deps);
}

function createDateService() {
	return createDateServiceWhichReturnsCurrentDate(new Date(100000000000));
}

function createDateServiceWhichReturnsCurrentDate(currentDate) {
	var ds = new DateService();
	spyOn(ds, "getCurrentDate").and.returnValue(currentDate);
	return ds;
}

function createTimestampFormatService() {
	return createTimestampFormatServiceWhichReturnsString("2018-02-05T02:23:21.518Z");
}

function createTimestampFormatServiceWhichReturnsString(timestampString) {
	var tfs = new TimestampFormatService();
	spyOn(tfs, "formatAsIso8601UtcTimestamp").and.returnValue(timestampString);
	return tfs;
}

function stringContainsString(outerString, innerString) {
	return outerString.indexOf(innerString) !== -1;
}
