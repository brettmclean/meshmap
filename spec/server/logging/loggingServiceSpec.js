require("../testUtils/init");
var loader = require("../testUtils/loader");

var LoggingService = loader.load("logging/LoggingService");
var FileLogProvider = loader.load("logging/FileLogProvider");
var ConsoleLogProvider = loader.load("logging/ConsoleLogProvider");
var LogBufferService = loader.load("logging/LogBufferService");
var AppLoggingConfig = loader.load("config/AppConfig").AppLoggingConfig;
var LogEntry = loader.load("logging/LogEntry");

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

		it("can overwrite existing config", function() {
			var clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.init(createAppLoggingConfigWithLogToConsole(true));
			ls.setConfig(createAppLoggingConfigWithLogToConsole(false));
			ls.info(DEFAULT_MESSAGE);

			expect(clp.info).not.toHaveBeenCalled();
		});
	});

	describe("setLogProviders method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.setLogProviders).toBe("function");
		});

		it("can overwrite existing log providers", function() {
			var le = createLogEntryWithLevelAndMessage(LOG_LEVEL_INFO, "First message"),
				lp = createFileLogProvider(),
				lbs = createLogBufferServiceWhichReturnsLogEntries([le]),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(createAppLoggingConfig());
			ls.setLogProviders([lp]);
			ls.setLogProviders([]);
			ls.info(DEFAULT_MESSAGE);

			expect(lp.info).not.toHaveBeenCalled();
		});
	});

	describe("error method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.error).toBe("function");
		});
	});

	describe("warn method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.warn).toBe("function");
		});

		it("calls warn on console log provider when log level config set to info", function() {
			var alc = createAppLoggingConfigWithLevel(LOG_LEVEL_INFO),
				clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.init(alc);
			ls.warn(DEFAULT_MESSAGE);

			expect(clp.warn).toHaveBeenCalled();
		});
	});

	describe("info method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.info).toBe("function");
		});

		it("calls info on console log provider with log entry at info level when service is uninitialized", function() {
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

		it("does not call info on console log provider when log to console is set to false", function() {
			var alc = createAppLoggingConfigWithLogToConsole(false),
				clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.init(alc);
			ls.info(DEFAULT_MESSAGE);

			expect(clp.info).not.toHaveBeenCalled();
		});

		it("calls queueEntry on log buffer service with log entry containing message when service is uninitialized", function() {
			var message = "My message 9874",
				lbs = createLogBufferService(),
				ls = createLoggingService({ logBufferService: lbs });

			ls.info(message);

			var providedLogEntry = lbs.queueEntry.calls.mostRecent().args[0];
			expect(providedLogEntry.message).toBe(message);
		});

		it("does not call dequeueAndClearEntries on log buffer service when service is initialized but log providers are not set", function() {
			var alc = createAppLoggingConfig(),
				lbs = createLogBufferService(),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(alc);
			ls.info(DEFAULT_MESSAGE);

			expect(lbs.dequeueAndClearEntries).not.toHaveBeenCalled();
		});

		it("calls dequeueAndClearEntries on log buffer service when service is initialized and log providers are set", function() {
			var lbs = createLogBufferService(),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(createAppLoggingConfig());
			ls.setLogProviders([createFileLogProvider()]);
			ls.info(DEFAULT_MESSAGE);

			expect(lbs.dequeueAndClearEntries).toHaveBeenCalled();
		});

		it("calls dequeueAndClearEntries on log buffer service even when zero log providers are set", function() {
			var lbs = createLogBufferService(),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(createAppLoggingConfig());
			ls.setLogProviders([]);
			ls.info(DEFAULT_MESSAGE);

			expect(lbs.dequeueAndClearEntries).toHaveBeenCalled();
		});

		it("calls info on set log providers with log entry returned by log buffer service", function() {
			var logEntry1 = createLogEntryWithLevelAndMessage(LOG_LEVEL_INFO, "First message"),
				logEntry2 = createLogEntryWithLevelAndMessage(LOG_LEVEL_INFO, "Second message"),
				logProvider1 = createFileLogProvider(),
				logProvider2 = createFileLogProvider(),
				lbs = createLogBufferServiceWhichReturnsLogEntries([logEntry1, logEntry2]),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(createAppLoggingConfig());
			ls.setLogProviders([logProvider1, logProvider2]);
			ls.info(DEFAULT_MESSAGE);

			expect(logProvider1.info).toHaveBeenCalledWith(logEntry1);
			expect(logProvider1.info).toHaveBeenCalledWith(logEntry2);
			expect(logProvider2.info).toHaveBeenCalledWith(logEntry1);
			expect(logProvider2.info).toHaveBeenCalledWith(logEntry2);
		});
	});

	describe("debug method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.debug).toBe("function");
		});

		it("does not call debug on console log provider when service is uninitialized", function() {
			var clp = createConsoleLogProvider(),
				ls = createLoggingService({ consoleLogProvider: clp });

			ls.debug(DEFAULT_MESSAGE);

			expect(clp.debug).not.toHaveBeenCalled();
		});
	});

	describe("trace method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.trace).toBe("function");
		});
	});

	describe("shutdown method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.shutdown).toBe("function");
		});

		it("calls hasEntries on log buffer service", function() {
			var lbs = createLogBufferService(),
				ls = createLoggingService({ logBufferService: lbs });

			ls.shutdown();

			expect(lbs.hasEntries).toHaveBeenCalled();
		});

		it("calls dequeueAndClearEntries on log buffer service when it has entries even if log providers have not been set", function() {
			var lbs = createLogBufferServiceWhichReturnsLogEntries([createLogEntry()]),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(createAppLoggingConfig());
			ls.shutdown();

			expect(lbs.dequeueAndClearEntries).toHaveBeenCalled();
		});

		it("does not call dequeueAndClearEntries on log buffer service when it has no entries", function() {
			var lbs = createLogBufferServiceWhichReturnsLogEntries([]),
				ls = createLoggingService({ logBufferService: lbs });

			ls.init(createAppLoggingConfig());
			ls.shutdown();

			expect(lbs.dequeueAndClearEntries).not.toHaveBeenCalled();
		});
	});

});

function createLoggingService(deps) {
	deps = deps || {};
	deps.consoleLogProvider = deps.consoleLogProvider || createConsoleLogProvider();
	deps.logBufferService = deps.logBufferService || createLogBufferService();

	return new LoggingService(deps);
}

function createConsoleLogProvider() {
	var clp = new ConsoleLogProvider({});
	spyOn(clp, "warn");
	spyOn(clp, "info");
	spyOn(clp, "debug");
	return clp;
}

function createFileLogProvider() {
	var flp = new FileLogProvider({});
	spyOn(flp, "info");
	return flp;
}

function createLogBufferService() {
	return createLogBufferServiceWhichReturnsLogEntries([]);
}

function createLogBufferServiceWhichReturnsLogEntries(logEntries) {
	var lbs = new LogBufferService();
	spyOn(lbs, "queueEntry");
	spyOn(lbs, "dequeueAndClearEntries").and.returnValue(logEntries);
	spyOn(lbs, "hasEntries").and.returnValue(logEntries.length > 0);
	return lbs;
}

function createLogEntry() {
	return createLogEntryWithLevelAndMessage(LOG_LEVEL_INFO, DEFAULT_MESSAGE);
}

function createLogEntryWithLevelAndMessage(level, message) {
	return new LogEntry(level, message);
}

function createAppLoggingConfig() {
	return createAppLoggingConfigWithLevelAndLogToConsole(LOG_LEVEL_INFO, true);
}

function createAppLoggingConfigWithLevel(level) {
	return createAppLoggingConfigWithLevelAndLogToConsole(level, true);
}

function createAppLoggingConfigWithLogToConsole(logToConsole) {
	return createAppLoggingConfigWithLevelAndLogToConsole(LOG_LEVEL_INFO, logToConsole);
}

function createAppLoggingConfigWithLevelAndLogToConsole(level, logToConsole) {
	var alc = new AppLoggingConfig();
	alc.level = level;
	alc.logToConsole = logToConsole;
	return alc;
}
