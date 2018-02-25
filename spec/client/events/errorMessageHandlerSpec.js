require("../testUtils/init");
var loader = require("../testUtils/loader");

loader.load("ui/dialogs/DialogButton");
loader.load("ui/dialogs/Dialog");
loader.load("ui/dialogs/TextDialog");

var ErrorMessageHandler = loader.load("events/messageHandlers/ErrorMessageHandler"),
	Logger = loader.load("utils/logging/Logger"),
	DialogService = loader.load("ui/DialogService"),
	AlertDialog = loader.load("ui/dialogs/AlertDialog");

var ERROR_MSG = "CPU is on fire";

describe("An error message handler", function() {

	it("does not throw error if logger and dialog service are not provided", function() {
		var emh = createErrorMessageHandler();

		expect(function() {
			emh.handle(ERROR_MSG);
		}).not.toThrow();

	});

	it("passes the error message to a logger", function(done) {
		var errorFake = function(errorMsg) {
			expect(errorMsg).toContain(ERROR_MSG);
			done();
		};
		var logger = createLoggerWithErrorFake(errorFake),
			emh = createErrorMessageHandler({ logger: logger });

		emh.handle(ERROR_MSG);
	});

	it("displays error message in an alert dialog", function(done) {
		var showDialogFake = function(dialog) {
			expect(dialog).toEqual(jasmine.any(AlertDialog));
			expect(dialog.title).toContain("error");
			expect(dialog.message).toBe(ERROR_MSG);
			done();
		};
		var ds = createDialogServiceWithShowDialogFake(showDialogFake),
			emh = createErrorMessageHandler({ dialogService: ds });

		emh.handle(ERROR_MSG);
	});

});

function createErrorMessageHandler(deps) {
	deps = deps || {};

	deps.logger = deps.logger || createLogger();
	deps.dialogService = deps.dialogService || createDialogService();

	return new ErrorMessageHandler(deps);
}

function createLogger() {
	return createLoggerWithErrorFake(function() {});
}

function createLoggerWithErrorFake(errorFake) {
	var logger = new Logger();
	spyOn(logger, "error").and.callFake(errorFake);
	return logger;
}

function createDialogService() {
	return createDialogServiceWithShowDialogFake(function() {});
}

function createDialogServiceWithShowDialogFake(showDialogFake) {
	var ds = new DialogService();
	spyOn(ds, "showDialog").and.callFake(showDialogFake);
	return ds;
}
