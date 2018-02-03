require("../testUtils/init");
var loader = require("../testUtils/loader");

var FileLogProvider = loader.load("logging/FileLogProvider");
var LogProviderBase = loader.load("logging/LogProviderBase");
var FileWriteService = loader.load("utils/FileWriteService");

var DEFAULT_LOG_DIRECTORY = "/path/to/log/dir";
var DEFAULT_LOG_FILE_PATH = "/path/to/log/file.log";

describe("A file log provider", function() {

	it("is a log provider", function() {
		var flp = createFileLogProvider();

		expect(flp instanceof LogProviderBase).toBe(true);
	});

	describe("init method", function() {

		it("calls ensureDirectoryExists on file write service and provides log directory path", function() {
			var fws = createFileWriteService(),
				flp = createFileLogProvider({ fileWriteService: fws }, "/my/log/dir");

			flp.init();

			expect(fws.ensureDirectoryExists).toHaveBeenCalledWith("/my/log/dir");
		});

	});

	describe("info method", function() {

		it("calls appendUtf8StringToFile on file write service with provided message", function() {
			var message = "My logged message",
				fws = createFileWriteService(),
				flp = createFileLogProvider({ fileWriteService: fws });

			flp.info(DEFAULT_LOG_FILE_PATH, message);

			expect(fws.appendUtf8StringToFile).toHaveBeenCalledWith(jasmine.any(String), message);
		});

		it("calls appendUtf8StringToFile on file write service with file path containing directory path", function() {
			var logDir = "/my/log/dir",
				fws = createFileWriteService(),
				flp = createFileLogProvider({ fileWriteService: fws }, logDir);

			flp.info("FilenameDoesNotMatter", "MessageDoesNotMatter");

			var callArgs = fws.appendUtf8StringToFile.calls.argsFor(0);
			expect(callArgs[0].indexOf(logDir)).not.toBe(-1);
		});

		it("calls appendUtf8StringToFile on file write service with file path containing directory path", function() {
			var logFilename = "2018-02-03.log",
				fws = createFileWriteService(),
				flp = createFileLogProvider({ fileWriteService: fws });

			flp.info(logFilename, "MessageDoesNotMatter");

			var callArgs = fws.appendUtf8StringToFile.calls.argsFor(0);
			expect(callArgs[0].indexOf(logFilename)).not.toBe(-1);
		});
	});

});

function createFileLogProvider(deps, directoryPath) {
	deps = deps || {};

	deps.fileWriteService = deps.fileWriteService || createFileWriteService();
	directoryPath = directoryPath || DEFAULT_LOG_DIRECTORY;

	return new FileLogProvider(deps, directoryPath);
}

function createFileWriteService() {
	var fws = new FileWriteService();
	spyOn(fws, "ensureDirectoryExists");
	spyOn(fws, "appendUtf8StringToFile").and.callFake(function(filePath, str, callback) {
		// jshint unused: false
		if(callback) {
			callback(null);
		}
	});
	return fws;
}
