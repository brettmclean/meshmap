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

		xit("calls getCurrentDate on date service", function() {

		});

		xit("calls formatAsIso8601UtcDate on timestamp format service providing date returned by date service", function() {

		});

		xit("returns filename containing UTC date returned by timestamp format service", function() {

		});

	});

});

function createFileLogLocationService(deps, logDirectoryConfig) {
	deps = deps || {};

	deps.timestampFormatService = deps.timestampFormatService || new TimestampFormatService();
	deps.dateService = deps.dateService || new DateService();

	logDirectoryConfig = logDirectoryConfig || DEFAULT_LOG_DIRECTORY_CONFIG;

	return new FileLogLocationService(deps, logDirectoryConfig);
}
