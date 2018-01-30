require("../testUtils/init");
var loader = require("../testUtils/loader");

var dateTimeFormatter = loader.load("utils/dateTimeFormatter");

describe("The Date/Time Formatter", function() {

	it("formats date and time information correctly", function() {

		var date = new Date(2015, 11, 6, 16, 6, 44, 82);
		var expected = "2015-12-06 16:06:44.082";

		var actual = dateTimeFormatter.formatDateAndTime(date);

		expect(expected).toBe(actual);
	});
});
