meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.ErrorMessageHandler = (function() {

	// imports
	var AlertDialog = meshmap.ui.dialogs.AlertDialog;

	var ErrorMessageHandler = function(deps) {
		deps = deps || {};

		this._logger = deps.logger || null;
		this._dialogService = deps.dialogService || null;
	};

	ErrorMessageHandler.prototype.handle = function(errorMsg) {
		if(this._logger) {
			this._logger.error("Error from server: " + errorMsg);
		}

		if(this._dialogService) {
			var dialog = new AlertDialog(
				"An error has occurred",
				errorMsg,
				null,
				null
			);

			this._dialogService.showDialog(dialog);
		}
	};

	return ErrorMessageHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.ErrorMessageHandler;
}
