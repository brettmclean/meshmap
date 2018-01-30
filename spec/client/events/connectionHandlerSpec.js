require("../testUtils/init");
var loader = require("../testUtils/loader");

loader.load("ui/dialogs/DialogButton");
loader.load("ui/dialogs/Dialog");
loader.load("ui/dialogs/TextDialog");
loader.load("ui/dialogs/AlertDialog");

var ConnectionHandler = loader.load("events/messageHandlers/ConnectionHandler"),
	DialogService = loader.load("ui/DialogService"),
	TextDialog = loader.load("ui/dialogs/TextDialog"),
	AlertDialog = loader.load("ui/dialogs/AlertDialog"),
	CommsService = loader.load("utils/comms/CommsService");

var simulateAttemptReconnect = function(connectionHandler) {
	connectionHandler._attemptReconnect();
};

var createConnectionHandlerWithDialogService = function(dialogService) {
	return new ConnectionHandler({
		dialogService: dialogService
	});
};

var createConnectionHandlerWithCommsService = function(commsService) {
	return new ConnectionHandler({
		commsService: commsService
	});
};

var createConnectionHandlerWithDialogServiceAndCommsService = function(dialogService, commsService) {
	return new ConnectionHandler({
		dialogService: dialogService,
		commsService: commsService
	});
};

describe("A Connection Handler", function() {

	it("shows an alert dialog when disconnected from server", function() {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds);

		spyOn(ds, "showDialog");
		ch.handleDisconnect();

		expect(ds.showDialog).toHaveBeenCalledWith(jasmine.any(AlertDialog));
	});

	it("will attempt to reconnect when user accepts disconnection dialog", function(done) {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds);

		spyOn(ch, "_attemptReconnect");

		spyOn(ds, "showDialog").and.callFake(function(dialog) {
			dialog.accept();
			expect(dialog.title).toBe("Connection lost");
			expect(ch._attemptReconnect).toHaveBeenCalled();
			done();
		});

		ch.handleDisconnect();
	});

	it("will ask comms service to reconnect when user attempts reconnect", function() {
		var ds = new DialogService(),
			cs = new CommsService(),
			ch = createConnectionHandlerWithDialogServiceAndCommsService(ds, cs);

		spyOn(cs, "reconnect");

		simulateAttemptReconnect(ch);
		expect(cs.reconnect).toHaveBeenCalled();
	});

	it("will show a text dialog when user attempts reconnect", function(done) {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds);

		spyOn(ds, "showDialog").and.callFake(function(dialog) {
			expect(dialog.title).toBe("Attempting to reconnect");
			expect(dialog).toEqual(jasmine.any(TextDialog));
			done();
		});

		simulateAttemptReconnect(ch);
	});

	it("does not show connection lost dialog if page is unloading", function() {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds);

		spyOn(ds, "showDialog");
		ch.setPageUnloading();
		ch.handleDisconnect();

		expect(ds.showDialog).not.toHaveBeenCalled();
	});

	it("dismisses the connection lost dialog when connection is established", function(done) {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds),
			connectionLostDialogHandle = null;

		spyOn(ds, "showDialog").and.callFake(function(dialog) {
			connectionLostDialogHandle = dialog.handle;
			ch.handleConnect();
		});

		spyOn(ds, "dismissDialog").and.callFake(function(dialogHandle) {
			expect(dialogHandle).toBe(connectionLostDialogHandle);
			done();
		});

		ch.handleDisconnect();
	});

	it("dismisses the reconnecting dialog when connection is established", function(done) {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds),
			reconnectingDialogHandle = null;

		spyOn(ds, "showDialog").and.callFake(function(dialog) {
			reconnectingDialogHandle = dialog.handle;
			ch.handleConnect();
		});

		spyOn(ds, "dismissDialog").and.callFake(function(dialogHandle) {
			expect(dialogHandle).toBe(reconnectingDialogHandle);
			done();
		});

		simulateAttemptReconnect(ch);
	});

	it("will not throw an error if not provided with comms service", function() {
		var ds = new DialogService(),
			ch = createConnectionHandlerWithDialogService(ds);

		expect(function() {
			simulateAttemptReconnect(ch);
		}).not.toThrow();
	});

	it("will not throw an error if not provided with dialog service", function() {
		var cs = new CommsService(),
			ch = createConnectionHandlerWithCommsService(cs);

		expect(function() {
			ch.handleDisconnect();
		}).not.toThrow();
	});

});
