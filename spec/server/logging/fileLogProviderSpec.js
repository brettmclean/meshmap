require("../testUtils/init");
var loader = require("../testUtils/loader");

var FileLogProvider = loader.load("logging/FileLogProvider");
var LogProviderBase = loader.load("logging/LogProviderBase");
var FileWriteService = loader.load("utils/FileWriteService");

var DEFAULT_LOG_DIRECTORY = "/path/to/log/dir";

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
