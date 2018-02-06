require("../testUtils/init");
var loader = require("../testUtils/loader");

var ConsoleLogProvider = loader.load("logging/ConsoleLogProvider");
var ConsoleOutputService = loader.load("utils/ConsoleOutputService");
var LogProviderBase = loader.load("logging/LogProviderBase");
var LogEntry = loader.load("logging/LogEntry");

var DEFAULT_LOG_LEVEL = "info";

describe("A console log provider", function() {

	it("is a log provider", function() {
		var clp = createConsoleLogProvider();

		expect(clp instanceof LogProviderBase).toBe(true);
	});

	describe("error method", function() {

		it("calls the error method on the console output service with provided message", function() {
			var le = createLogEntryWithMessage("MyErrorMessage"),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ consoleOutputService: cos });

			clp.error(le);

			expect(cos.error).toHaveBeenCalledWith("MyErrorMessage");
		});

	});

	describe("warn method", function() {

		it("calls the warn method on the console output service with provided message", function() {
			var le = createLogEntryWithMessage("MyWarnMessage"),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ consoleOutputService: cos });

			clp.warn(le);

			expect(cos.warn).toHaveBeenCalledWith("MyWarnMessage");
		});

	});

	describe("info method", function() {

		it("calls the info method on the console output service with provided message", function() {
			var le = createLogEntryWithMessage("MyInfoMessage"),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ consoleOutputService: cos });

			clp.info(le);

			expect(cos.info).toHaveBeenCalledWith("MyInfoMessage");
		});

	});

	describe("debug method", function() {

		it("calls the debug method on the console output service with provided message", function() {
			var le = createLogEntryWithMessage("MyDebugMessage"),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ consoleOutputService: cos });

			clp.debug(le);

			expect(cos.debug).toHaveBeenCalledWith("MyDebugMessage");
		});

	});

	describe("trace method", function() {

		it("calls the debug method on the console output service with provided message", function() {
			var le = createLogEntryWithMessage("MyTraceMessage"),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ consoleOutputService: cos });

			clp.trace(le);

			expect(cos.debug).toHaveBeenCalledWith("MyTraceMessage");
		});

	});

});

function createConsoleLogProvider(deps) {
	deps = deps || {};
	deps.consoleOutputService = deps.consoleOutputService || createConsoleOutputService();

	return new ConsoleLogProvider(deps);
}

function createConsoleOutputService() {
	var cos = new ConsoleOutputService();
	spyOn(cos, "error");
	spyOn(cos, "warn");
	spyOn(cos, "info");
	spyOn(cos, "debug");
	return cos;
}

function createLogEntryWithMessage(message) {
	return new LogEntry(DEFAULT_LOG_LEVEL, message);
}
