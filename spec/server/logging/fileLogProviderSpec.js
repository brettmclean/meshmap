var os = require("os");

require("../testUtils/init");
var loader = require("../testUtils/loader");

var FileLogProvider = loader.load("logging/FileLogProvider");
var LogProviderBase = loader.load("logging/LogProviderBase");
var FileWriteService = loader.load("utils/FileWriteService");
var FileLogLocationService = loader.load("logging/FileLogLocationService");
var TextLineLogEntryFormatter = loader.load("logging/TextLineLogEntryFormatter");
var LogEntry = loader.load("logging/LogEntry");

var DEFAULT_LOG_DIRECTORY = "/path/to/log/dir";
var DEFAULT_LOG_FILENAME = "2018-02-04.log";
var DEFAULT_LOG_LEVEL = "info";
var DEFAULT_LOG_MESSAGE = "Application starting...";
var DEFAULT_LOG_ENTRY = new LogEntry(DEFAULT_LOG_LEVEL, DEFAULT_LOG_MESSAGE);

describe("A file log provider", function() {

	it("is a log provider", function() {
		var flp = createFileLogProvider();

		expect(flp instanceof LogProviderBase).toBe(true);
	});

	describe("init method", function() {

		it("calls getAbsoluteLogDirectory on file log location service", function() {
			var flls = createFileLogLocationService(),
				flp = createFileLogProvider({ fileLogLocationService: flls });

			flp.init();

			expect(flls.getAbsoluteLogDirectory).toHaveBeenCalled();
		});

		it("calls ensureDirectoryExists on file write service and provides log directory path", function() {
			var flls = createFileLogLocationServiceWithLogDirectory("/my/log/dir"),
				fws = createFileWriteService(),
				flp = createFileLogProvider({ fileLogLocationService: flls, fileWriteService: fws });

			flp.init();

			expect(fws.ensureDirectoryExists).toHaveBeenCalledWith("/my/log/dir");
		});

	});

	describe("info method", function() {

		it("calls format method on text line log entry formatter with given log entry", function() {
			var le = createLogEntryWithMessage("MyInfoMessage"),
				tllef = createTextLineLogEntryFormatter(),
				flp = createFileLogProvider({ textLineLogEntryFormatter: tllef });

			flp.init();
			flp.info(le);

			expect(tllef.format).toHaveBeenCalledWith(le);
		});

		it("calls getLogFilename on file log location service", function() {
			var flls = createFileLogLocationService(),
				flp = createFileLogProvider({ fileLogLocationService: flls });

			flp.init();
			flp.info(DEFAULT_LOG_ENTRY);

			expect(flls.getLogFilename).toHaveBeenCalled();
		});

		it("calls appendUtf8StringToFile on file write service with text returned by text line log entry formatter and new line", function() {
			var output = "FormattedInfoOutput",
				expectedWrittenOutput = output + os.EOL,
				tllef = createTextLineLogEntryFormatterWhichReturnsLine(output),
				fws = createFileWriteService(),
				flp = createFileLogProvider({ textLineLogEntryFormatter: tllef, fileWriteService: fws });

			flp.init();
			flp.info(DEFAULT_LOG_ENTRY);

			expect(fws.appendUtf8StringToFile).toHaveBeenCalledWith(jasmine.any(String), expectedWrittenOutput, jasmine.any(Function));
		});

		it("calls appendUtf8StringToFile on file write service with file path containing directory path", function() {
			var logDir = "/my/log/dir",
				flls = createFileLogLocationServiceWithLogDirectory(logDir),
				fws = createFileWriteService(),
				flp = createFileLogProvider({ fileLogLocationService: flls, fileWriteService: fws });

			flp.init();
			flp.info(DEFAULT_LOG_ENTRY);

			var callArgs = fws.appendUtf8StringToFile.calls.argsFor(0);
			expect(callArgs[0].indexOf(logDir)).not.toBe(-1);
		});

		it("calls appendUtf8StringToFile on file write service with file path containing file name returned from file log location service", function() {
			var logFilename = "2018-02-03.log",
				flls = createFileLogLocationServiceWithFilename(logFilename),
				fws = createFileWriteService(),
				flp = createFileLogProvider({ fileLogLocationService: flls, fileWriteService: fws });

			flp.init();
			flp.info(DEFAULT_LOG_ENTRY);

			var callArgs = fws.appendUtf8StringToFile.calls.argsFor(0);
			expect(callArgs[0].indexOf(logFilename)).not.toBe(-1);
		});

		it("does not attempt to write to log file until first write has completed", function() {
			var appendCallback = function() {},
				fws = createFileWriteServiceWithAppendFake(appendCallback),
				flp = createFileLogProvider({ fileWriteService: fws });

			flp.init();
			flp.info(new LogEntry(DEFAULT_LOG_LEVEL, "A"));
			flp.info(new LogEntry(DEFAULT_LOG_LEVEL, "B"));
			flp.info(new LogEntry(DEFAULT_LOG_LEVEL, "C"));

			expect(fws.appendUtf8StringToFile.calls.count()).toBe(1);
		});
	});

});

function createFileLogProvider(deps) {
	deps = deps || {};

	deps.fileWriteService = deps.fileWriteService || createFileWriteService();
	deps.fileLogLocationService = deps.fileLogLocationService || createFileLogLocationService();
	deps.textLineLogEntryFormatter = deps.textLineLogEntryFormatter || createTextLineLogEntryFormatter();

	return new FileLogProvider(deps);
}

function createFileLogLocationService() {
	return createFileLogLocationServiceWithLogDirectoryAndFilename(DEFAULT_LOG_DIRECTORY, DEFAULT_LOG_FILENAME);
}

function createFileLogLocationServiceWithLogDirectory(absoluteLogDirectory) {
	return createFileLogLocationServiceWithLogDirectoryAndFilename(absoluteLogDirectory, DEFAULT_LOG_FILENAME);
}

function createFileLogLocationServiceWithFilename(logFilename) {
	return createFileLogLocationServiceWithLogDirectoryAndFilename(DEFAULT_LOG_DIRECTORY, logFilename);
}

function createFileLogLocationServiceWithLogDirectoryAndFilename(absoluteLogDirectory, logFilename) {
	var flls = new FileLogLocationService({});
	spyOn(flls, "getAbsoluteLogDirectory").and.returnValue(absoluteLogDirectory);
	spyOn(flls, "getLogFilename").and.returnValue(logFilename);
	return flls;
}

function createFileWriteService() {
	return createFileWriteServiceWithAppendFake(function(filePath, str, callback) {
		// jshint unused: false
		if(callback) {
			callback(null);
		}
	});
}

function createFileWriteServiceWithAppendFake(fakeFunc) {
	var fws = new FileWriteService();
	spyOn(fws, "ensureDirectoryExists");
	spyOn(fws, "appendUtf8StringToFile").and.callFake(fakeFunc);
	return fws;
}

function createTextLineLogEntryFormatter() {
	return createTextLineLogEntryFormatterWhichReturnsLine("DefaultFormattedOutput");
}

function createTextLineLogEntryFormatterWhichReturnsLine(textLine) {
	var tllef = new TextLineLogEntryFormatter({});
	spyOn(tllef, "format").and.returnValue(textLine);
	return tllef;
}

function createLogEntryWithMessage(message) {
	return new LogEntry(DEFAULT_LOG_LEVEL, message);
}
