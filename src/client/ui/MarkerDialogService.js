meshmap.namespace("meshmap.ui");

meshmap.ui.MarkerDialogService = (function() {

	// imports
	var ConfirmDialog = meshmap.ui.dialogs.ConfirmDialog,
		ViewDialog = meshmap.ui.dialogs.ViewDialog,
		DialogButton = meshmap.ui.dialogs.DialogButton,
		EditMarkerContext = meshmap.map.EditMarkerContext;

	function MarkerDialogService(deps) {
		this._dialogService = deps.dialogService;

		this._lastMarkerInfoDialogHandle = null;
	}

	MarkerDialogService.prototype.showConfirmDeletionDialog = function(marker, confirmCallback) {
		var confirmDialog = new ConfirmDialog(
			"Delete Location?",
			"Are you sure you want to delete \"" + marker.name + "\"? This cannot be undone.",
			{
				positiveButtonText: "Yes, delete it",
				positiveCallback: this._onDeletionConfirmed.bind(this, confirmCallback),
				negativeButtonText: "No, keep it"
			});
		confirmDialog.buttons[0].classes = ["btn-danger"];

		this._dialogService.showDialog(confirmDialog);
	};

	MarkerDialogService.prototype.showEditMarkerDialog = function(marker, doneCallback) {
		var editMarkerContextScope = new EditMarkerContext(marker);
		var dialog = new ViewDialog(
			"Edit Location",
			"EditMarkerNewCtrl",
			"html/partials/editmarker-new.html",
			editMarkerContextScope);
		var doneBtn = new DialogButton(
			"Done",
			true,
			this._onFinishEdit.bind(this, doneCallback));
		doneBtn.addClass("btn-primary");
		dialog.buttons.push(doneBtn);

		this._dialogService.showDialog(dialog);
	};

	MarkerDialogService.prototype.showMarkerInfoDialog = function(markerInfoContext) {

		var viewDialog = new ViewDialog(
			markerInfoContext.marker.name,
			"MarkerInfoNewCtrl",
			"html/partials/markerinfo-new.html",
			markerInfoContext
		);

		var closeBtn = new DialogButton(
			"Close",
			false,
			null
		);
		closeBtn.addClass("btn-primary");
		viewDialog.buttons.push(closeBtn);

		this._dialogService.showDialog(viewDialog);
		this._lastMarkerInfoDialogHandle = viewDialog.handle;
	};

	MarkerDialogService.prototype.dismissMarkerInfoDialog = function() {
		if(this._lastMarkerInfoDialogHandle) {
			this._dialogService.dismissDialog(this._lastMarkerInfoDialogHandle);
			this._lastMarkerInfoDialogHandle = null;
		}
	};

	MarkerDialogService.prototype._onDeletionConfirmed = function(confirmCallback) {
		this._callIfFunction(confirmCallback);
	};

	MarkerDialogService.prototype._onFinishEdit = function(doneCallback) {
		this._callIfFunction(doneCallback);
	};

	MarkerDialogService.prototype._callIfFunction = function(func) {
		if(typeof func === "function") {
			func();
		}
	};

	return MarkerDialogService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.MarkerDialogService;
}
