meshmap.namespace("meshmap.state");

meshmap.state.PageStateService = (function() {

	var PageStateService = function(deps) {
		this._eventBus = deps.eventBus;
	};

	PageStateService.prototype.init = function() {
		this._listenForPageUnload();
	};

	PageStateService.prototype._listenForPageUnload = function() {
		var pageUnloadCallback = this._onPageUnload.bind(this);
		if(window.attachEvent) {
			window.attachEvent("onbeforeunload", pageUnloadCallback);
		} else {
			window.addEventListener("beforeunload", pageUnloadCallback);
		}
	};

	PageStateService.prototype._onPageUnload = function() {
		this._eventBus.publish("pageUnloading");
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
