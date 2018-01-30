meshmap.namespace("meshmap.ui.dialogs");

meshmap.ui.dialogs.TextDialog = (function() {

	// imports
	var Dialog = meshmap.ui.dialogs.Dialog;

	var baseClass = Dialog;
	var TextDialog = function(title, text) {
		baseClass.call(this, title);
		this.message = text;
	};
	TextDialog.prototype = Object.create(baseClass.prototype);
	TextDialog.prototype.constructor = TextDialog;

	return TextDialog;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.dialogs.TextDialog;
}
