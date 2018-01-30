require("../../testUtils/init");
var loader = require("../../testUtils/loader");

var LogProviderBase = loader.load("utils/logging/LogProviderBase"),
	ValueError = loader.load("errors/ValueError"),
	Logger = loader.load("utils/logging/Logger");

var ensureLoggerCallsLogProviderMethodOnce = function(methodName) {
	var logProvider = spyOnLogProviderInteraction(methodName, "");

	var methodCallCount = getNumberOfCallsToMethod(logProvider, methodName);
	expect(methodCallCount).toBe(1);
};

var ensureLoggerPassesMessageToLogProvider = function(methodName, logMsg) {
	var logProvider = spyOnLogProviderInteraction(methodName, logMsg);

	var callArgs = logProvider[methodName].calls.first().args;
	var firstArg = callArgs[0];
	expect(firstArg).toContain(logMsg);
};

var ensureLoggerDoesNotLogForLogLevel = function(methodName, logLevel) {
	var logMsg = "Don't care";
	var lp = spyOnLogProviderInteractionWithLogLevel(methodName, logLevel, logMsg);

	var methodCallCount = getNumberOfCallsToMethod(lp, methodName);
	expect(methodCallCount).toBe(0);
};

var ensureLoggerLogsForLogLevel = function(methodName, logLevel) {
	var logMsg = "Don't care";
	var lp = spyOnLogProviderInteractionWithLogLevel(methodName, logLevel, logMsg);

	var methodCallCount = getNumberOfCallsToMethod(lp, methodName);
	expect(methodCallCount).toBe(1);
};

var spyOnLogProviderInteraction = function(methodName, logMsg) {
	return spyOnLogProviderInteractionWithLogLevel(methodName, null, logMsg);
};

var spyOnLogProviderInteractionWithLogLevel = function(methodName, logLevel, logMsg) {
	var lp = new LogProviderBase();
	var l = new Logger(lp, logLevel);

	spyOn(lp, methodName);
	l[methodName](logMsg);

	return lp;
};

var getNumberOfCallsToMethod = function(obj, methodName) {
	var funcCalls = obj[methodName].calls;
	return funcCalls.count();
};

describe("A Logger", function() {

	it("throws a TypeError if not provided a valid LogProviderBase", function() {
		expect(function() {
			// jshint unused: false
			var l = new Logger({});
		}).toThrowError(TypeError);
	});

	it("does not throw an Error when provided a valid LogProviderBase", function() {
		expect(function() {
			// jshint unused: false
			var l = new Logger(new LogProviderBase());
		}).not.toThrow();
	});

	it("does not throw an Error when provided only a log level", function() {
		expect(function() {
			// jshint unused: false
			var l = new Logger(Logger.levels.WARN);
		}).not.toThrow();
	});

	it("throws a ValueError when provided an invalid log level", function() {
		expect(function() {
			// jshint unused: false
			var l = new Logger("invalid");
		}).toThrowError(ValueError);
	});

	it("calls the error method of its log provider only once", function() {
		ensureLoggerCallsLogProviderMethodOnce("error");
	});

	it("calls the warn method of its log provider only once", function() {
		ensureLoggerCallsLogProviderMethodOnce("warn");
	});

	it("calls the info method of its log provider only once", function() {
		ensureLoggerCallsLogProviderMethodOnce("info");
	});

	it("calls the debug method of its log provider only once", function() {
		ensureLoggerCallsLogProviderMethodOnce("debug");
	});

	it("calls the trace method of its log provider only once", function() {
		ensureLoggerCallsLogProviderMethodOnce("trace");
	});

	it("calls the error method of its log provider with string containing logged message", function() {
		ensureLoggerPassesMessageToLogProvider("error", "Error test message");
	});

	it("calls the warn method of its log provider with string containing logged message", function() {
		ensureLoggerPassesMessageToLogProvider("warn", "Warn test message");
	});

	it("calls the info method of its log provider with string containing logged message", function() {
		ensureLoggerPassesMessageToLogProvider("info", "Info test message");
	});

	it("calls the debug method of its log provider with string containing logged message", function() {
		ensureLoggerPassesMessageToLogProvider("debug", "Debug test message");
	});

	it("calls the trace method of its log provider with string containing logged message", function() {
		ensureLoggerPassesMessageToLogProvider("trace", "Trace test message");
	});

	it("should not call the warn method of its log provider if the log level is too restrictive", function() {
		ensureLoggerDoesNotLogForLogLevel("warn", Logger.levels.ERROR);
	});

	it("should not call the info method of its log provider if the log level is too restrictive", function() {
		ensureLoggerDoesNotLogForLogLevel("info", Logger.levels.WARN);
	});

	it("should not call the debug method of its log provider if the log level is too restrictive", function() {
		ensureLoggerDoesNotLogForLogLevel("debug", Logger.levels.INFO);
	});

	it("should not call the trace method of its log provider if the log level is too restrictive", function() {
		ensureLoggerDoesNotLogForLogLevel("trace", Logger.levels.DEBUG);
	});

	it("should call the warn method of its log provider if the log level allows it", function() {
		ensureLoggerLogsForLogLevel("warn", Logger.levels.WARN);
		ensureLoggerLogsForLogLevel("warn", Logger.levels.INFO);
	});

	it("can change its log level after initialization", function() {
		var lp = new LogProviderBase();
		var l = new Logger(lp, Logger.levels.ERROR);
		var logMsg = "Don't care";

		spyOn(lp, "warn");

		l.warn(logMsg);
		var methodCallCount = getNumberOfCallsToMethod(lp, "warn");
		expect(methodCallCount).toBe(0);

		l.setLogLevel(Logger.levels.INFO);
		l.warn(logMsg);
		methodCallCount = getNumberOfCallsToMethod(lp, "warn");
		expect(methodCallCount).toBe(1);
	});

	it("can share singleton instance", function() {
		var logger = new Logger();
		logger.setAsSingletonInstance();

		expect(Logger.instance).toBe(logger);
	});
});
