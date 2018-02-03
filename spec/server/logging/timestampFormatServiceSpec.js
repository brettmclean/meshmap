require("../testUtils/init");
var loader = require("../testUtils/loader");

var TimestampFormatService = loader.load("logging/TimestampFormatService");

describe("A timestamp format service", function() {

	describe("formatDateAsIso8601UtcTimestamp method", function() {

		it("exists", function() {
			var tfs = new TimestampFormatService();

			expect(typeof tfs.formatDateAsIso8601UtcTimestamp).toBe("function");
		});

		it("correctly returns date/time as ISO 8601 string", function() {
			var tfs = new TimestampFormatService();
			var utcDate = new Date(1000910000654); // Sep 19, 2001 at 14:33:20.654

			var iso8601String = tfs.formatDateAsIso8601UtcTimestamp(utcDate);

			expect(iso8601String).toBe("2001-09-19T14:33:20.654Z");
		});

	});

});
