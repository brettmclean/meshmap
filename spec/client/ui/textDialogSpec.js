require("../testUtils/init");
var loader = require("../testUtils/loader");

var Dialog = loader.load("ui/dialogs/Dialog"),
	TextDialog = loader.load("ui/dialogs/TextDialog");

var DIALOG_TITLE = "Edit Marker";
var DIALOG_TEXT = "You do not have permission to edit this marker.";

describe("A Text Dialog", function() {

	it("is a Dialog", function() {
		var expected = DIALOG_TITLE;
		var td = new TextDialog(expected);

		expect(td instanceof Dialog).toBeTruthy();
		expect(td.title).toBe(expected);
	});

	it("has message text", function() {
		var expected = DIALOG_TEXT;
		var td = new TextDialog(DIALOG_TITLE, expected);

		expect(td.message).toBe(expected);
	});

});
