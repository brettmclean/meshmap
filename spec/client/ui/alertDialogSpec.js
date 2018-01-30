require("../testUtils/init");
var loader = require("../testUtils/loader");

var TextDialog = loader.load("ui/dialogs/TextDialog"),
	AlertDialog = loader.load("ui/dialogs/AlertDialog");

var DIALOG_TITLE = "Edit Marker";
var DIALOG_TEXT = "You do not have permission to edit this marker.";
var BUTTON_TEXT = "That's fine";

describe("An Alert Dialog", function() {
	it("is a TextDialog", function() {
		var ad = new AlertDialog(DIALOG_TITLE, DIALOG_TEXT);

		expect(ad instanceof TextDialog).toBeTruthy();
		expect(ad.title).toBe(DIALOG_TITLE);
		expect(ad.message).toBe(DIALOG_TEXT);
	});

	it("is created with accept button", function() {
		var ad = new AlertDialog(DIALOG_TITLE, DIALOG_TEXT, {
			buttonText: BUTTON_TEXT
		});

		expect(ad.buttons.length).toBe(1);
		expect(ad.buttons[0].text).toBe(BUTTON_TEXT);
	});

	it("calls the provided callback with true when accepted", function(done) {
		var buttonCallback = function(value) {
			expect(value).toBe(true);
			done();
		};

		var ad = new AlertDialog(DIALOG_TITLE, DIALOG_TEXT, {
			buttonText: BUTTON_TEXT,
			callback: buttonCallback
		});

		ad.accept();
	});
});
