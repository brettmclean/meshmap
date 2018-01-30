meshmap.namespace("meshmap.ui.dialogs");

meshmap.ui.dialogs.ConfirmDialog = (function() {

	// imports
	var TextDialog = meshmap.ui.dialogs.TextDialog,
		DialogButton = meshmap.ui.dialogs.DialogButton;

	var baseClass = TextDialog;
	var ConfirmDialog = function(title, text, options) {
		baseClass.call(this, title, text);

		options = options || {};

		addButton.call(this, options.positiveButtonText || "OK",
			true, options.positiveCallback);

		addButton.call(this, options.negativeButtonText || "Cancel",
			false, options.negativeCallback);
	};
	ConfirmDialog.prototype = Object.create(baseClass.prototype);
	ConfirmDialog.prototype.constructor = ConfirmDialog;

	var addButton = function(text, value, callback) {
		var button = new DialogButton(
			text,
			value,
			callback
		);
		button.addClass("btn-primary");
		this.buttons.push(button);
	};

	ConfirmDialog.prototype.accept = function() {
		this.buttons[0].click();
	};

	ConfirmDialog.prototype.reject = function() {
		this.buttons[1].click();
	};

	return ConfirmDialog;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.dialogs.ConfirmDialog;
}
