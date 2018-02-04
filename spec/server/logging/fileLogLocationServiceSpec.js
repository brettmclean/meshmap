require("../testUtils/init");
var loader = require("../testUtils/loader");

var FileLogLocationService = loader.load("logging/FileLogLocationService");
var TimestampFormatService = loader.load("logging/TimestampFormatService");
var DateService = loader.load("utils/DateService");

var DEFAULT_LOG_DIRECTORY_CONFIG = "../logs";

describe("A file log location service", function() {

	describe("getAbsoluteLogDirectory method", function() {

		it("exists", function() {
			var flls = createFileLogLocationService();

			expect(typeof flls.getAbsoluteLogDirectory).toBe("function");
		});

		it("returns configured log directory when it is an absolute path", function() {
			var logDirectoryConfig = "/absolute/path/to/log/dir",
				flls = createFileLogLocationService({}, logDirectoryConfig);

			var resolvedLogDir = flls.getAbsoluteLogDirectory();

			expect(resolvedLogDir).toBe(logDirectoryConfig);
		});

	});

	describe("getLogFilename method", function() {

		it("exists", function() {
			var flls = createFileLogLocationService();

			expect(typeof flls.getLogFilename).toBe("function");
		});

		it("calls getCurrentDate on date service", function() {
			var ds = createDateServiceWhichReturnsArbitraryDate(),
				flls = createFileLogLocationService({ dateService: ds });

			flls.getLogFilename();

			expect(ds.getCurrentDate).toHaveBeenCalled();
		});

		it("calls formatAsIso8601UtcDate on timestamp format service providing date returned by date service", function() {
			var date = new Date(90000000),
				ds = createDateServiceWhichReturnsDate(date),
				tfs = createTimestampFormatServiceWhichReturnsArbitraryDateString(),
				flls = createFileLogLocationService({ dateService: ds, timestampFormatService: tfs });

			flls.getLogFilename();

			expect(tfs.formatAsIso8601UtcDate).toHaveBeenCalledWith(date);
		});

		it("returns filename containing UTC date returned by timestamp format service", function() {
			var dateString = "2007-05-09",
				tfs = createTimestampFormatServiceWhichReturnsDateString("2007-05-09"),
				flls = createFileLogLocationService({ timestampFormatService: tfs });

			var logFilename = flls.getLogFilename();

			expect(logFilename.indexOf(dateString)).not.toBe(-1);
		});

	});

});

function createFileLogLocationService(deps, logDirectoryConfig) {
	deps = deps || {};

	deps.timestampFormatService = deps.timestampFormatService || new TimestampFormatService();
	deps.dateService = deps.dateService || createDateServiceWhichReturnsArbitraryDate();

	logDirectoryConfig = logDirectoryConfig || DEFAULT_LOG_DIRECTORY_CONFIG;

	return new FileLogLocationService(deps, logDirectoryConfig);
}

function createTimestampFormatServiceWhichReturnsArbitraryDateString() {
	return createTimestampFormatServiceWhichReturnsDateString("2018-02-03");
}

function createTimestampFormatServiceWhichReturnsDateString(dateString) {
	var tfs = new TimestampFormatService();
	spyOn(tfs, "formatAsIso8601UtcDate").and.returnValue(dateString);
	return tfs;
}

function createDateServiceWhichReturnsArbitraryDate() {
	return createDateServiceWhichReturnsDate(new Date(1000000000000));
}

function createDateServiceWhichReturnsDate(date) {
	var ds = new DateService();
	spyOn(ds, "getCurrentDate").and.returnValue(date);
	return ds;
}
