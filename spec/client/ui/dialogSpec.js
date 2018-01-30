require("../testUtils/init");
var loader = require("../testUtils/loader");

var Dialog = loader.load("ui/dialogs/Dialog"),
	DialogButton = loader.load("ui/dialogs/DialogButton");

var DIALOG_TITLE = "Edit Marker";

var createDialogButton = function(text, value, callback) {
	return new DialogButton(text, value, callback);
};

describe("A Dialog", function() {

	it("has a title", function() {
		var expected = DIALOG_TITLE;
		var d = new Dialog(expected);

		expect(d.title).toBe(expected);
	});

	it("has a unique handle", function() {
		var d = new Dialog();
		var d2 = new Dialog();

		expect(d.handle).toBeDefined();
		expect(d.handle).not.toEqual(d2.handle);
	});

	it("can have buttons", function() {
		var button1 = createDialogButton("OK", true);
		var button2 = createDialogButton("Cancel", false);

		var d = new Dialog();
		d.addButton(button1).addButton(button2);

		expect(d.buttons.length).toBe(2);
		expect(d.buttons[0]).toBe(button1);
		expect(d.buttons[1]).toBe(button2);
	});

	it("throws a TypeError if given a non-DialogButton", function() {
		expect(function() {
			var d = new Dialog();
			d.addButton({});
		}).toThrowError(TypeError);
	});

});
