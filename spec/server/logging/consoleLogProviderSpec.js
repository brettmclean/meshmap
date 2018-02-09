require("../testUtils/init");
var loader = require("../testUtils/loader");

var ConsoleLogProvider = loader.load("logging/ConsoleLogProvider");
var TextLineLogEntryFormatter = loader.load("logging/TextLineLogEntryFormatter");
var ConsoleOutputService = loader.load("utils/ConsoleOutputService");
var LogProviderBase = loader.load("logging/LogProviderBase");
var LogEntry = loader.load("logging/LogEntry");

var DEFAULT_LOG_LEVEL = "info";
var DEFAULT_LOG_ENTRY = new LogEntry("info", "Application starting...");

describe("A console log provider", function() {

	it("is a log provider", function() {
		var clp = createConsoleLogProvider();

		expect(clp instanceof LogProviderBase).toBe(true);
	});

	describe("error method", function() {

		it("calls format method on text line log entry formatter with given log entry", function() {
			var le = createLogEntryWithMessage("MyErrorMessage"),
				tllef = createTextLineLogEntryFormatter(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef });

			clp.error(le);

			expect(tllef.format).toHaveBeenCalledWith(le);
		});

		it("calls the error method on the console output service with text returned by text line log entry formatter", function() {
			var output = "FormattedErrorOutput",
				tllef = createTextLineLogEntryFormatterWhichReturnsLine(output),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef, consoleOutputService: cos });

			clp.error(DEFAULT_LOG_ENTRY);

			expect(cos.error).toHaveBeenCalledWith(output);
		});

	});

	describe("warn method", function() {

		it("calls format method on text line log entry formatter with given log entry", function() {
			var le = createLogEntryWithMessage("MyWarnMessage"),
				tllef = createTextLineLogEntryFormatter(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef });

			clp.warn(le);

			expect(tllef.format).toHaveBeenCalledWith(le);
		});

		it("calls the warn method on the console output service with text returned by text line log entry formatter", function() {
			var output = "FormattedWarnOutput",
				tllef = createTextLineLogEntryFormatterWhichReturnsLine(output),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef, consoleOutputService: cos });

			clp.warn(DEFAULT_LOG_ENTRY);

			expect(cos.warn).toHaveBeenCalledWith(output);
		});

	});

	describe("info method", function() {

		it("calls format method on text line log entry formatter with given log entry", function() {
			var le = createLogEntryWithMessage("MyInfoMessage"),
				tllef = createTextLineLogEntryFormatter(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef });

			clp.info(le);

			expect(tllef.format).toHaveBeenCalledWith(le);
		});

		it("calls the info method on the console output service with text returned by text line log entry formatter", function() {
			var output = "FormattedInfoOutput",
				tllef = createTextLineLogEntryFormatterWhichReturnsLine(output),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef, consoleOutputService: cos });

			clp.info(DEFAULT_LOG_ENTRY);

			expect(cos.info).toHaveBeenCalledWith(output);
		});

	});

	describe("debug method", function() {

		it("calls format method on text line log entry formatter with given log entry", function() {
			var le = createLogEntryWithMessage("MyDebugMessage"),
				tllef = createTextLineLogEntryFormatter(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef });

			clp.debug(le);

			expect(tllef.format).toHaveBeenCalledWith(le);
		});

		it("calls the info method on the console output service with text returned by text line log entry formatter", function() {
			var output = "FormattedDebugOutput",
				tllef = createTextLineLogEntryFormatterWhichReturnsLine(output),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef, consoleOutputService: cos });

			clp.debug(DEFAULT_LOG_ENTRY);

			expect(cos.debug).toHaveBeenCalledWith(output);
		});

	});

	describe("trace method", function() {

		it("calls format method on text line log entry formatter with given log entry", function() {
			var le = createLogEntryWithMessage("MyTraceMessage"),
				tllef = createTextLineLogEntryFormatter(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef });

			clp.trace(le);

			expect(tllef.format).toHaveBeenCalledWith(le);
		});

		it("calls the info method on the console output service with text returned by text line log entry formatter", function() {
			var output = "FormattedTraceOutput",
				tllef = createTextLineLogEntryFormatterWhichReturnsLine(output),
				cos = createConsoleOutputService(),
				clp = createConsoleLogProvider({ textLineLogEntryFormatter: tllef, consoleOutputService: cos });

			clp.trace(DEFAULT_LOG_ENTRY);

			expect(cos.debug).toHaveBeenCalledWith(output);
		});

	});

});

function createConsoleLogProvider(deps) {
	deps = deps || {};
	deps.textLineLogEntryFormatter = deps.textLineLogEntryFormatter || createTextLineLogEntryFormatter();
	deps.consoleOutputService = deps.consoleOutputService || createConsoleOutputService();

	return new ConsoleLogProvider(deps);
}

function createTextLineLogEntryFormatter() {
	return createTextLineLogEntryFormatterWhichReturnsLine("DefaultFormattedOutput");
}

function createTextLineLogEntryFormatterWhichReturnsLine(textLine) {
	var tllef = new TextLineLogEntryFormatter({});
	spyOn(tllef, "format").and.returnValue(textLine);
	return tllef;
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
