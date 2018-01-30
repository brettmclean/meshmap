meshmap.namespace("meshmap.ui.dialogs");

meshmap.ui.dialogs.Dialog = (function() {

	// imports
	var DialogButton = meshmap.ui.dialogs.DialogButton;

	var nextHandle = 1;

	var Dialog = function(title) {
		this.title = title;
		this.handle = nextHandle++;
		this.buttons = [];
	};

	Dialog.prototype.addButton = function(dialogButton) {
		if(!(dialogButton instanceof DialogButton)) {
			throw new TypeError("Argument must be DialogButton");
		}

		this.buttons.push(dialogButton);
		return this;
	};

	return Dialog;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.dialogs.Dialog;
}
