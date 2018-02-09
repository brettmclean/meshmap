require("../testUtils/init");
var loader = require("../testUtils/loader");

var LogBufferService = loader.load("logging/LogBufferService");
var LogEntry = loader.load("logging/LogEntry");

describe("A log buffer service", function() {

	describe("queueEntry method", function() {

		it("exists", function() {
			var lbs = new LogBufferService();

			expect(typeof lbs.queueEntry).toBe("function");
		});
	});

	describe("dequeueAndClearEntries method", function() {
		it("exists", function() {
			var lbs = new LogBufferService();

			expect(typeof lbs.dequeueAndClearEntries).toBe("function");
		});

		it("retains log level of queued log entry", function() {
			var lbs = new LogBufferService();
			var expectedLogLevel = "debug";

			lbs.queueEntry(createLogEntry(expectedLogLevel, "Application starting..."));
			var entries = lbs.dequeueAndClearEntries();

			expect(entries[0].level).toBe(expectedLogLevel);
		});

		it("retains message of queued log entry", function() {
			var lbs = new LogBufferService();
			var expectedLogMessage = "Application starting...";

			lbs.queueEntry(createLogEntry("debug", expectedLogMessage));
			var entries = lbs.dequeueAndClearEntries();

			expect(entries[0].message).toBe(expectedLogMessage);
		});

		it("returns count of enqueued messages", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry(createLogEntry("debug", "Message 1"));
			lbs.queueEntry(createLogEntry("info", "Message 2"));
			lbs.queueEntry(createLogEntry("warn", "Message 3"));
			var entries = lbs.dequeueAndClearEntries();

			expect(entries.length).toBe(3);
		});

		it("retains correct log level for each entry", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry(createLogEntry("debug", "Message 1"));
			lbs.queueEntry(createLogEntry("info", "Message 2"));
			var entries = lbs.dequeueAndClearEntries();

			expect(entries[0].level).not.toBe(entries[1].level);
		});

		it("clears entry queue", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry(createLogEntry("trace", "Message 1"));
			lbs.dequeueAndClearEntries();
			var entries = lbs.dequeueAndClearEntries();

			expect(entries.length).toBe(0);
		});
	});

	describe("hasEntries method", function() {

		it("exists", function() {
			var lbs = new LogBufferService();

			expect(typeof lbs.hasEntries).toBe("function");
		});

		it("returns true after entries have been queued", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry(createLogEntry("trace", "Message 1"));
			var hasEntries = lbs.hasEntries();

			expect(hasEntries).toBe(true);
		});

		it("returns false by default", function() {
			var lbs = new LogBufferService();

			var hasEntries = lbs.hasEntries();

			expect(hasEntries).toBe(false);
		});

		it("returns false after entries have been dequeued", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry(createLogEntry("trace", "Message 1"));
			lbs.dequeueAndClearEntries();
			var hasEntries = lbs.hasEntries();

			expect(hasEntries).toBe(false);
		});

	});

});

function createLogEntry(level, message) {
	return new LogEntry(level, message);
}
