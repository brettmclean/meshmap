require("../testUtils/init");
var loader = require("../testUtils/loader");

var TimestampFormatService = loader.load("logging/TimestampFormatService");

describe("A timestamp format service", function() {

	describe("formatAsIso8601UtcTimestamp method", function() {

		it("exists", function() {
			var tfs = new TimestampFormatService();

			expect(typeof tfs.formatAsIso8601UtcTimestamp).toBe("function");
		});

		it("correctly returns date/time as ISO 8601 string", function() {
			var tfs = new TimestampFormatService();
			var utcDate = new Date(1000910000654); // Sep 19, 2001 at 14:33:20.654

			var iso8601Timestamp = tfs.formatAsIso8601UtcTimestamp(utcDate);

			expect(iso8601Timestamp).toBe("2001-09-19T14:33:20.654Z");
		});

	});

	describe("formatAsIso8601UtcDate", function() {

		it("exists", function() {
			var tfs = new TimestampFormatService();

			expect(typeof tfs.formatAsIso8601UtcDate).toBe("function");
		});

		it("correctly returns date as ISO 8601 string", function() {
			var tfs = new TimestampFormatService();
			var utcDate = new Date(1100000000000); // Nov 9, 2004 at 11:33:20.000

			var iso8601Date = tfs.formatAsIso8601UtcDate(utcDate);

			expect(iso8601Date).toBe("2004-11-09");
		});

	});

});
