require("../testUtils/init");
var loader = require("../testUtils/loader");

var ViewDialog = loader.load("ui/dialogs/ViewDialog"),
	Dialog = loader.load("ui/dialogs/Dialog");

var DIALOG_TITLE = "Edit Marker";
var CONTROLLER_NAME = "EditMarkerCtrl";
var VIEW_PATH = "html/partials/editmarker.html";
var VIEW_SCOPE = {};

describe("A View Dialog", function() {

	it("is a Dialog", function() {
		var vd = new ViewDialog(DIALOG_TITLE);

		expect(vd instanceof Dialog).toBeTruthy();
		expect(vd.title).toBe(DIALOG_TITLE);
	});

	it("has a title, controller name, include path and scope", function() {
		var vd = new ViewDialog(DIALOG_TITLE, CONTROLLER_NAME, VIEW_PATH, VIEW_SCOPE);

		expect(vd.title).toBe(DIALOG_TITLE);
		expect(vd.view.controller).toBe(CONTROLLER_NAME);
		expect(vd.view.includePath).toBe(VIEW_PATH);
		expect(vd.view.scope).toBe(VIEW_SCOPE);
	});
});
