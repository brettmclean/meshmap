meshmap.namespace("meshmap.state");

meshmap.state.PageStateService = (function() {

	var PageStateService = function(deps) {
		deps = deps || {};

		this._eventBus = deps.eventBus || null;

		this._listenForPageUnload();
	};

	PageStateService.instance = null;

	PageStateService.prototype._listenForPageUnload = function() {
		if(typeof window !== "undefined") {
			var pageUnloadCallback = this._onPageUnload.bind(this);
			if(window.attachEvent) {
				window.attachEvent("onbeforeunload", pageUnloadCallback);
			} else {
				window.addEventListener("beforeunload", pageUnloadCallback);
			}
		}
	};

	PageStateService.prototype._onPageUnload = function() {
		if(this._eventBus) {
			this._eventBus.publish("pageUnloading");
		}
	};

	PageStateService.prototype.setAsSingletonInstance = function() {
		PageStateService.instance = this;
	};

	PageStateService.prototype.getPath = function() {
		return document.location.pathname;
	};

	return PageStateService;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.state.PageStateService;
}
