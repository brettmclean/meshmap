meshmap.namespace("meshmap.ui.dialogs");

meshmap.ui.dialogs.AlertDialog = (function() {

	// imports
	var TextDialog = meshmap.ui.dialogs.TextDialog,
		DialogButton = meshmap.ui.dialogs.DialogButton;

	var baseClass = TextDialog;
	var AlertDialog = function(title, text, options) {
		baseClass.call(this, title, text);

		options = options || {};

		var acceptButton = new DialogButton(
			options.buttonText || "OK",
			true,
			options.callback
		);
		acceptButton.addClass("btn-primary");
		this.buttons.push(acceptButton);
	};
	AlertDialog.prototype = Object.create(baseClass.prototype);
	AlertDialog.prototype.constructor = AlertDialog;

	AlertDialog.prototype.accept = function() {
		this.buttons[0].click();
	};

	return AlertDialog;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.dialogs.AlertDialog;
}
