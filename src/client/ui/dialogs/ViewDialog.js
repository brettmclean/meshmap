meshmap.namespace("meshmap.ui.dialogs");

meshmap.ui.dialogs.ViewDialog = (function() {

	// imports
	var Dialog = meshmap.ui.dialogs.Dialog;

	var baseClass = Dialog;
	var ViewDialog = function(title, controllerName, viewPath, viewScope) {
		baseClass.call(this, title);

		this.view = {
			controller: controllerName,
			includePath: viewPath,
			scope: viewScope
		};
	};
	ViewDialog.prototype = Object.create(baseClass.prototype);
	ViewDialog.prototype.constructor = ViewDialog;

	return ViewDialog;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.dialogs.ViewDialog;
}
