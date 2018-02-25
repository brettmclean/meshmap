meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.ErrorMessageHandler = (function() {

	// imports
	var AlertDialog = meshmap.ui.dialogs.AlertDialog;

	var ErrorMessageHandler = function(deps) {
		this._logger = deps.logger;
		this._dialogService = deps.dialogService;
	};

	ErrorMessageHandler.prototype.handle = function(errorMsg) {
		this._logger.error("Error from server: " + errorMsg);

		var dialog = new AlertDialog(
			"An error has occurred",
			errorMsg,
			null,
			null
		);

		this._dialogService.showDialog(dialog);
	};

	return ErrorMessageHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.ErrorMessageHandler;
}
