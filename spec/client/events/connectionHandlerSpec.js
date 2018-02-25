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

describe("A Connection Handler", function() {

	it("shows an alert dialog when disconnected from server", function() {
		var ds = createDialogService(),
			ch = createConnectionHandler({ dialogService: ds });

		ch.handleDisconnect();

		expect(ds.showDialog).toHaveBeenCalledWith(jasmine.any(AlertDialog));
	});

	it("will attempt to reconnect when user accepts disconnection dialog", function(done) {
		var showDialogFake = function(dialog) {
			dialog.accept();
			expect(dialog.title).toBe("Connection lost");
			expect(ch._attemptReconnect).toHaveBeenCalled();
			done();
		};

		var ds = createDialogServiceWithShowDialogFake(showDialogFake),
			ch = createConnectionHandler({ dialogService: ds });

		spyOn(ch, "_attemptReconnect");

		ch.handleDisconnect();
	});

	it("will ask comms service to reconnect when user attempts reconnect", function() {
		var cs = createCommsService(),
			ch = createConnectionHandler({
				commsService: cs
			});

		simulateAttemptReconnect(ch);
		expect(cs.reconnect).toHaveBeenCalled();
	});

	it("will show a text dialog when user attempts reconnect", function(done) {
		var showDialogFake = function(dialog) {
			expect(dialog.title).toBe("Attempting to reconnect");
			expect(dialog).toEqual(jasmine.any(TextDialog));
			done();
		};

		var ds = createDialogServiceWithShowDialogFake(showDialogFake),
			ch = createConnectionHandler({ dialogService: ds });

		simulateAttemptReconnect(ch);
	});

	it("does not show connection lost dialog if page is unloading", function() {
		var ds = createDialogService(),
			ch = createConnectionHandler({ dialogService: ds });

		ch.setPageUnloading();
		ch.handleDisconnect();

		expect(ds.showDialog).not.toHaveBeenCalled();
	});

	it("dismisses the connection lost dialog when connection is established", function(done) {
		var showDialogFake = function(dialog) {
			connectionLostDialogHandle = dialog.handle;
			ch.handleConnect();
		};
		var dismissDialogFake = function(dialogHandle) {
			expect(dialogHandle).toBe(connectionLostDialogHandle);
			done();
		};

		var ds = createDialogServiceWithShowDialogFakeAndDismissDialogFake(showDialogFake, dismissDialogFake),
			ch = createConnectionHandler({ dialogService: ds }),
			connectionLostDialogHandle = null;

		ch.handleDisconnect();
	});

	it("dismisses the reconnecting dialog when connection is established", function(done) {
		var showDialogFake = function(dialog) {
			reconnectingDialogHandle = dialog.handle;
			ch.handleConnect();
		};
		var dismissDialogFake = function(dialogHandle) {
			expect(dialogHandle).toBe(reconnectingDialogHandle);
			done();
		};

		var ds = createDialogServiceWithShowDialogFakeAndDismissDialogFake(showDialogFake, dismissDialogFake),
			ch = createConnectionHandler({ dialogService: ds }),
			reconnectingDialogHandle = null;

		simulateAttemptReconnect(ch);
	});

	it("will not throw an error if not provided with comms service", function() {
		var ds = createDialogService(),
			ch = createConnectionHandler({ dialogService: ds });

		expect(function() {
			simulateAttemptReconnect(ch);
		}).not.toThrow();
	});

	it("will not throw an error if not provided with dialog service", function() {
		var cs = createCommsService(),
			ch = createConnectionHandler({ commsService: cs });

		expect(function() {
			ch.handleDisconnect();
		}).not.toThrow();
	});

});

function simulateAttemptReconnect(connectionHandler) {
	connectionHandler._attemptReconnect();
}

function createConnectionHandler(deps) {
	deps = deps || {};

	deps.dialogService = deps.dialogService || createDialogService();
	deps.commsService = deps.commsService || createCommsService();

	return new ConnectionHandler(deps);
}

function createCommsService() {
	var cs = new CommsService({});
	spyOn(cs, "reconnect");
	return cs;
}

function createDialogService() {
	return createDialogServiceWithShowDialogFake(function() {});
}

function createDialogServiceWithShowDialogFake(showDialogFake) {
	return createDialogServiceWithShowDialogFakeAndDismissDialogFake(showDialogFake, function() {});
}

function createDialogServiceWithShowDialogFakeAndDismissDialogFake(showDialogFake, dismissDialogFake) {
	var ds = new DialogService();
	spyOn(ds, "showDialog").and.callFake(showDialogFake);
	spyOn(ds, "dismissDialog").and.callFake(dismissDialogFake);
	return ds;
}
