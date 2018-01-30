require("../testUtils/init");
var loader = require("../testUtils/loader");

var TextDialog = loader.load("ui/dialogs/TextDialog"),
	ConfirmDialog = loader.load("ui/dialogs/ConfirmDialog");

var DIALOG_TITLE = "Delete Marker";
var DIALOG_TEXT = "Are you sure you want to delete this marker?";
var POS_BUTTON_TEXT = "Sure thing";
var NEG_BUTTON_TEXT = "Nah";

describe("A Confirm Dialog", function() {

	it("is a TextDialog", function() {
		var cd = new ConfirmDialog(DIALOG_TITLE, DIALOG_TEXT);

		expect(cd instanceof TextDialog).toBeTruthy();
		expect(cd.title).toBe(DIALOG_TITLE);
		expect(cd.message).toBe(DIALOG_TEXT);
	});

	it("is created with positive and negative answer buttons", function() {
		var cd = new ConfirmDialog(DIALOG_TITLE, DIALOG_TEXT, {
			positiveButtonText: POS_BUTTON_TEXT,
			negativeButtonText: NEG_BUTTON_TEXT
		});

		expect(cd.buttons.length).toBe(2);
		expect(cd.buttons[0].text).toBe(POS_BUTTON_TEXT);
		expect(cd.buttons[1].text).toBe(NEG_BUTTON_TEXT);
	});

	it("positive callback is called with true when dialog is accepted", function(done) {
		var buttonCallback = function(value) {
			expect(value).toBe(true);
			done();
		};

		var cd = new ConfirmDialog(DIALOG_TITLE, DIALOG_TEXT, {
			positiveCallback: buttonCallback
		});

		cd.accept();
	});

	it("negative callback is called with false when dialog is rejected", function(done) {
		var buttonCallback = function(value) {
			expect(value).toBe(false);
			done();
		};

		var cd = new ConfirmDialog(DIALOG_TITLE, DIALOG_TEXT, {
			negativeCallback: buttonCallback
		});

		cd.reject();
	});

});
