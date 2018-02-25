meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.ConnectionHandler = (function() {

	// imports
	var TextDialog = meshmap.ui.dialogs.TextDialog,
		AlertDialog = meshmap.ui.dialogs.AlertDialog;

	var ConnectionHandler = function(deps) {
		this._dialogService = deps.dialogService;
		this._commsService = deps.commsService;

		this._dialogHandle = null;
		this._reconnectTimer = null;

		this._pageUnloading = false;
	};

	var RECONNECTING_DIALOG_SHOWN_MS = 2000;

	var showDialog = function(dialog) {
		this._dialogService.showDialog(dialog);
	};

	var dismissDialog = function(dialogHandle) {
		this._dialogService.dismissDialog(dialogHandle);
	};

	var dismissConnectionDialog = function() {
		if(this._dialogHandle) {
			dismissDialog.call(this, this._dialogHandle);
			this._dialogHandle = null;
		}

		/* istanbul ignore if */
		if(this._reconnectTimer) {
			clearTimeout(this._reconnectTimer);
			this._reconnectTimer = null;
		}
	};

	ConnectionHandler.prototype.handleDisconnect = function() {
		dismissConnectionDialog.call(this);

		if(this._pageUnloading) {
			return;
		}

		var dialog = new AlertDialog(
			"Connection lost",
			"Please ensure you are connected to the internet or try again later.",
			{
				buttonText: "Reconnect",
				callback: this._attemptReconnect.bind(this)
			}
		);
		this._dialogHandle = dialog.handle;

		showDialog.call(this, dialog);
	};

	ConnectionHandler.prototype._attemptReconnect = function() {
		this._commsService.reconnect();

		showReconnectingDialog.call(this);
	};

	var showReconnectingDialog = function() {
		var self = this;
		var dialog = new TextDialog(
			"Attempting to reconnect",
			"Reconnecting..."
		);
		this._dialogHandle = dialog.handle;

		showDialog.call(this, dialog);

		/* istanbul ignore next */
		this._reconnectTimer = setTimeout(function() {
			self._reconnectTimer = null;
			self.handleDisconnect();
		}, RECONNECTING_DIALOG_SHOWN_MS);
	};

	ConnectionHandler.prototype.handleConnect = function() {
		dismissConnectionDialog.call(this);
	};

	ConnectionHandler.prototype.setPageUnloading = function() {
		this._pageUnloading = true;
	};

	return ConnectionHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.ConnectionHandler;
}
