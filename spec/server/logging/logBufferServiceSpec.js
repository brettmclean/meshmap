require("../testUtils/init");
var loader = require("../testUtils/loader");

var LogBufferService = loader.load("logging/LogBufferService");

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

			lbs.queueEntry(expectedLogLevel, "Application starting...");
			var entries = lbs.dequeueAndClearEntries();

			expect(entries[0].level).toBe(expectedLogLevel);
		});

		it("retains message of queued log entry", function() {
			var lbs = new LogBufferService();
			var expectedLogMessage = "Application starting...";

			lbs.queueEntry("debug", expectedLogMessage);
			var entries = lbs.dequeueAndClearEntries();

			expect(entries[0].message).toBe(expectedLogMessage);
		});

		it("returns count of enqueued messages", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry("debug", "Message 1");
			lbs.queueEntry("info", "Message 2");
			lbs.queueEntry("warn", "Message 3");
			var entries = lbs.dequeueAndClearEntries();

			expect(entries.length).toBe(3);
		});

		it("retains correct log level for each entry", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry("debug", "Message 1");
			lbs.queueEntry("info", "Message 2");
			var entries = lbs.dequeueAndClearEntries();

			expect(entries[0].level).not.toBe(entries[1].level);
		});

		it("clears entry queue", function() {
			var lbs = new LogBufferService();

			lbs.queueEntry("trace", "Message 1");
			lbs.dequeueAndClearEntries();
			var entries = lbs.dequeueAndClearEntries();

			expect(entries.length).toBe(0);
		});
	});

});
