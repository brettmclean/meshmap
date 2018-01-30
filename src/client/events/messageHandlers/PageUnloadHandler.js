meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.PageUnloadHandler = (function() {

	var PageUnloadHandler = function(deps) {
		deps = deps || {};

		this._extentUpdater = deps.extentUpdater || null;
	};

	PageUnloadHandler.prototype.handle = function() {
		attemptFinalMapExtentPush.call(this);
	};

	var attemptFinalMapExtentPush = function() {
		if(this._extentUpdater) {
			this._extentUpdater.push();
		}
	};

	return PageUnloadHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.PageUnloadHandler;
}
