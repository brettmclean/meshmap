require("../testUtils/init");
var loader = require("../testUtils/loader");

var DialogButton = loader.load("ui/dialogs/DialogButton");

var BUTTON_TEXT = "OK";
var BUTTON_VALUE = true;

describe("A Dialog Button", function() {

	it("has text", function() {
		var expected = BUTTON_TEXT;
		var db = new DialogButton(expected);

		expect(db.text).toBe(expected);
	});

	it("has a value", function() {
		var expected = BUTTON_VALUE;
		var db = new DialogButton(BUTTON_TEXT, expected);

		expect(db.value).toBe(expected);
	});

	it("calls the provided callback with value when clicked", function(done) {
		var expectedValue = BUTTON_VALUE;
		var callback = function(value) {
			expect(value).toBe(expectedValue);
			done();
		};

		var db = new DialogButton(BUTTON_TEXT, expectedValue, callback);
		db.click();
	});

	it("does not require a callback be provided", function() {
		var db = new DialogButton(BUTTON_TEXT, BUTTON_VALUE);

		expect(function() {
			db.click();
		}).not.toThrow();
	});

	it("can add CSS classes to button", function() {
		var db = new DialogButton();
		db.addClass("js-a").addClass("btn-primary");

		expect(db.classes.length).toBe(2);
		expect(db.classes[0]).toBe("js-a");
		expect(db.classes[1]).toBe("btn-primary");
	});

	it("can add multiple CSS classes at once to button", function() {
		var db = new DialogButton();
		db.addClass("js-a js-b js-c");

		expect(db.classes.length).toBe(3);
		expect(db.classes[0]).toBe("js-a");
		expect(db.classes[1]).toBe("js-b");
		expect(db.classes[2]).toBe("js-c");
	});

});
