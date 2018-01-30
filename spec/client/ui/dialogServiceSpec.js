require("../testUtils/init");
var loader = require("../testUtils/loader");

loader.load("ui/dialogs/Dialog");

var DialogService = loader.load("ui/DialogService"),
	EventBus = loader.load("events/EventBus"),
	TextDialog = loader.load("ui/dialogs/TextDialog");

var DIALOG_TITLE = "Edit Marker";
var DIALOG_TEXT = "You do not have permission to edit this marker.";

var createTextDialog = function() {
	return new TextDialog(DIALOG_TITLE, DIALOG_TEXT);
};

var createDialogService = function() {
	return new DialogService();
};

var createDialogServiceWithEventBus = function(eventBus) {
	return new DialogService({
		eventBus: eventBus
	});
};

describe("A Dialog Service", function() {

	it("can share singleton instance", function() {
		var ds = createDialogService();
		ds.setAsSingletonInstance();

		expect(DialogService.instance).toBe(ds);
	});

	it("fires a dialogRequested event when a dialog is asked to be shown", function(done) {
		var eb = new EventBus(),
			ds = createDialogServiceWithEventBus(eb),
			d = createTextDialog();

		eb.subscribe("dialogRequested", function(dialog) {
			expect(dialog).toBe(d);
			done();
		});

		ds.showDialog(d);
	});

	it("throws a TypeError when a non-Dialog is asked to be shown", function() {
		var ds = createDialogService();

		expect(function() {
			ds.showDialog({});
		}).toThrowError(TypeError);
	});

	it("fires a dialogDismissalRequested event when dialog handle is asked to be dismissed", function(done) {
		var eb = new EventBus(),
			ds = createDialogServiceWithEventBus(eb),
			d = createTextDialog();

		ds.showDialog(d);

		eb.subscribe("dialogDismissalRequested", function(handle) {
			expect(handle).toBe(d.handle);
			done();
		});

		ds.dismissDialog(d.handle);
	});

	it("throws a TypeError when a non-Number handle is passed to dismiss dialog", function() {
		var ds = createDialogService();

		expect(function() {
			ds.dismissDialog({});
		}).toThrowError(TypeError);
	});

	it("fires a currentDialogDismissalRequested event when current dialog is dismissed", function(done) {
		var eb = new EventBus(),
			ds = createDialogServiceWithEventBus(eb);

		eb.subscribe("currentDialogDismissalRequested", done);

		ds.dismissCurrentDialog();
	});

});
