meshmap.namespace("meshmap.map");

meshmap.map.ExtentUpdater = (function() {

	// imports
	var dm = meshmap.models;

	var POLLING_INTERVAL = 1000;

	var ExtentUpdater = function(strategy, commsService) {
		this._strategy = strategy;
		this._commsService = commsService;
		this._lastPushedExtent = null;
		this._currExtent = null;
		this._lastPushedTime = 0;
	};

	ExtentUpdater.instance = null;

	/* istanbul ignore next */
	ExtentUpdater.prototype.watchExtentChanges = function() {
		setInterval(checkExtentChanges.bind(this), POLLING_INTERVAL);
	};

	/* istanbul ignore next */
	var checkExtentChanges = function() {
		var msSinceLastUpdate = (new Date()).getTime() - this._lastPushedTime;
		var extentOutdated = this._strategy.extentIsOutdated(this._lastPushedExtent, this._currExtent, msSinceLastUpdate);
		if(extentOutdated) {
			this.push();
		}
	};

	ExtentUpdater.prototype.setExtent = function(mapExtent) {
		validateExtent(mapExtent);
		this._currExtent = mapExtent;
	};

	var validateExtent = function(mapExtent) {
		if(!(mapExtent instanceof dm.MapExtent)) {
			throw new TypeError("Must provide MapExtent");
		}
	};

	ExtentUpdater.prototype.push = function() {
		if(canSendUpdate(this)) {
			this._commsService.sendMessage(
				"mapEvent",
				new meshmap.models.MapEvent("changeExtent", this._currExtent)
			);
			this._lastPushedExtent = this._currExtent;
			this._lastPushedTime = (new Date()).getTime();
		}
	};

	var canSendUpdate = function(extentUpdater) {
		var hasExtentToSend = !!extentUpdater._currExtent;
		var extentIsDifferentFromLastPushed = extentUpdater._lastPushedExtent !== extentUpdater._currExtent;
		return hasExtentToSend && extentIsDifferentFromLastPushed;
	};

	ExtentUpdater.prototype.setAsSingletonInstance = function() {
		ExtentUpdater.instance = this;
	};

	return ExtentUpdater;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.ExtentUpdater;
}
