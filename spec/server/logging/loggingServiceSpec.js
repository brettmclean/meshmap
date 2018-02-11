require("../testUtils/init");
var loader = require("../testUtils/loader");

var LoggingService = loader.load("logging/LoggingService");
var ConsoleLogProvider = loader.load("logging/ConsoleLogProvider");
var AppLoggingConfig = loader.load("config/AppConfig").AppLoggingConfig;

var DEFAULT_MESSAGE = "Application starting...";
var LOG_LEVEL_WARN = "warn";
var LOG_LEVEL_INFO = "info";
var LOG_LEVEL_DEBUG = "debug";

describe("A logging service", function() {

	describe("init method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.init).toBe("function");
		});
	});

	describe("setConfig method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.setConfig).toBe("function");
		});
	});

	describe("info method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.info).toBe("function");
		});

		it("calls info on console log provider with log entry at info level without first initializing logging service", function() {
			var clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.info(DEFAULT_MESSAGE);

			var providedLogEntry = clp.info.calls.mostRecent().args[0];
			expect(providedLogEntry.level).toBe(LOG_LEVEL_INFO);
		});

		it("calls info on console log provider when log level config set to debug", function() {
			var alc = createAppLoggingConfigWithLevel(LOG_LEVEL_DEBUG),
				clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.init(alc);
			ls.info(DEFAULT_MESSAGE);

			expect(clp.info).toHaveBeenCalled();
		});

		it("does not call info on console log provider when log level config set to warn", function() {
			var alc = createAppLoggingConfigWithLevel(LOG_LEVEL_WARN),
				clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.init(alc);
			ls.info(DEFAULT_MESSAGE);

			expect(clp.info).not.toHaveBeenCalled();
		});
	});

	describe("shutdown method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.shutdown).toBe("function");
		});
	});

});

function createLoggingService(deps) {
	deps = deps || {};
	deps.consoleLogProvider = deps.consoleLogProvider || createConsoleLogProvider();

	return new LoggingService(deps);
}

function createConsoleLogProvider() {
	var clp = new ConsoleLogProvider({});
	spyOn(clp, "info");
	return clp;
}

function createAppLoggingConfigWithLevel(level) {
	return createAppLoggingConfigWithLevelAndLogToConsole(level, true);
}

function createAppLoggingConfigWithLevelAndLogToConsole(level, logToConsole) {
	var alc = new AppLoggingConfig();
	alc.level = level;
	alc.logToConsole = logToConsole;
	return alc;
}
