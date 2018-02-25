meshmap.namespace("meshmap.events.messageHandlers");

meshmap.events.messageHandlers.MapEventHandler = (function() {

	// imports
	var dm = meshmap.models,
		Marker = dm.Marker,
		MapEvent = dm.MapEvent;

	var MapEventHandler = function(deps) {
		this._siteService = deps.siteService;
	};

	var EVENT_TYPE_HANDLER_MAPPINGS = {};

	EVENT_TYPE_HANDLER_MAPPINGS[MapEvent.ADD_MARKER] = function(mapEvent) {
		var marker = Marker.parse(mapEvent.data);
		this._siteService.addMarker(marker);
	};

	EVENT_TYPE_HANDLER_MAPPINGS[MapEvent.REMOVE_MARKER] = function(mapEvent) {
		var markerId = mapEvent.data;
		this._siteService.removeMarker(markerId);
	};

	EVENT_TYPE_HANDLER_MAPPINGS[MapEvent.UPDATE_MARKER] = function(mapEvent) {
		var markerObj = mapEvent.data;
		this._siteService.updateMarkerFromRemoteChange(markerObj);
	};

	MapEventHandler.prototype.handle = function(mapEvent) {
		var handlerFunc = EVENT_TYPE_HANDLER_MAPPINGS[mapEvent.type];

		if(typeof handlerFunc === "function") {
			handlerFunc.call(this, mapEvent);
		}
	};

	return MapEventHandler;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.events.messageHandlers.MapEventHandler;
}
