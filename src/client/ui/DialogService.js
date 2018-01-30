meshmap.namespace("meshmap.ui");

meshmap.ui.DialogService = (function() {

	// imports
	var Dialog = meshmap.ui.dialogs.Dialog;

	var DialogService = function(deps) {
		deps = deps || /* istanbul ignore next */ {};

		this._eventBus = deps.eventBus || null;
	};

	var fireEvent = function(eventName) {
		callEventBusPublish.call(this, [eventName]);
	};

	var fireEventWithArg = function(eventName, eventArg) {
		callEventBusPublish.call(this, [eventName, eventArg]);
	};

	var callEventBusPublish = function(publishArgs) {
		if(this._eventBus) {
			this._eventBus.publish.apply(this._eventBus, publishArgs);
		}
	};

	DialogService.instance = null;

	DialogService.prototype.showDialog = function(dialog) {
		if(!(dialog instanceof Dialog)) {
			throw new TypeError("argument must be of type Dialog");
		}

		fireEventWithArg.call(this, "dialogRequested", dialog);
	};

	DialogService.prototype.dismissDialog = function(handle) {
		if(typeof handle !== "number") {
			throw new TypeError("argument must be of type number");
		}

		fireEventWithArg.call(this, "dialogDismissalRequested", handle);
	};

	DialogService.prototype.dismissCurrentDialog = function() {
		fireEvent.call(this, "currentDialogDismissalRequested");
	};

	DialogService.prototype.setAsSingletonInstance = function() {
		DialogService.instance = this;
	};

	return DialogService;
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.ui.DialogService;
}
