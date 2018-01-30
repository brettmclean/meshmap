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

var createErrorMessageHandler = function() {
	return new ErrorMessageHandler();
};

var createErrorMessageHandlerWithLogger = function(logger) {
	return new ErrorMessageHandler({
		logger: logger
	});
};

var createErrorMessageHandlerWithDialogService = function(dialogService) {
	return new ErrorMessageHandler({
		dialogService: dialogService
	});
};

describe("An error message handler", function() {

	it("does not throw error if logger and dialog service are not provided", function() {
		var emh = createErrorMessageHandler();

		expect(function() {
			emh.handle(ERROR_MSG);
		}).not.toThrow();

	});

	it("passes the error message to a logger", function(done) {
		var logger = new Logger(),
			emh = createErrorMessageHandlerWithLogger(logger);

		spyOn(logger, "error").and.callFake(function(errorMsg) {
			expect(errorMsg).toContain(ERROR_MSG);
			done();
		});

		emh.handle(ERROR_MSG);
	});

	it("displays error message in an alert dialog", function(done) {
		var ds = new DialogService(),
			emh = createErrorMessageHandlerWithDialogService(ds);

		spyOn(ds, "showDialog").and.callFake(function(dialog) {
			expect(dialog).toEqual(jasmine.any(AlertDialog));
			expect(dialog.title).toContain("error");
			expect(dialog.message).toBe(ERROR_MSG);
			done();
		});

		emh.handle(ERROR_MSG);
	});

});
