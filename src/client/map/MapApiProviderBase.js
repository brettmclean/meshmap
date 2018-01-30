meshmap.namespace("meshmap.map");

meshmap.map.MapApiProviderBase = (function() {

	// imports
	var observable = MicroEvent.mixin;

	var DRAWING_POINT = "point";
	var DRAWING_POLYLINE = "polyline";
	var DRAWING_POLYGON = "polygon";

	var MapApiProviderBase = function(deps) {
		deps = deps || {};

		this._markerIcons = null;
		this._markerColors = null;

		this._containerEl = deps.containerEl || null;
		this._markerSelectorContainerEl = null;

		this._currPointSymbol = null;
		this._currPolylineSymbol = null;
		this._currPolygonsymbol = null;
	};
	MapApiProviderBase.prototype = {
		DRAWING_POINT: DRAWING_POINT,
		DRAWING_POLYLINE: DRAWING_POLYLINE,
		DRAWING_POLYGON: DRAWING_POLYGON
	};

	MapApiProviderBase.prototype.initMap = function() {};

	MapApiProviderBase.prototype.getMarkerSelectionContainer = function() {
		return this._markerSelectorContainerEl;
	};

	MapApiProviderBase.prototype.setMarkerIcons = function(markerIcons) {
		this._markerIcons = markerIcons;
	};

	MapApiProviderBase.prototype.setMarkerColors = function(markerColors) {
		this._markerColors = markerColors;
	};

	MapApiProviderBase.prototype.clearMarkers = function() {};

	MapApiProviderBase.prototype.setDrawingMode = function(drawingMode) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.addPointMarker = function(pointMarker) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.addPolylineMarker = function(polylineMarker) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.addPolygonMarker = function(polygonMarker) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.removeMarker = function(marker) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.setExtent = function(mapExtent) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.setActiveMarkerType = function(markerType) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.setMapHeight = function(mapHeightPx) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype.setPointSymbol = function(pointSymbol) {
		this._currPointSymbol = pointSymbol;
	};

	MapApiProviderBase.prototype.setPolylineSymbol = function(polylineSymbol) {
		this._currPolylineSymbol = polylineSymbol;
	};

	MapApiProviderBase.prototype.setPolygonSymbol = function(polygonSymbol) {
		this._currPolygonSymbol = polygonSymbol;
	};

	MapApiProviderBase.prototype.showMarkerInfo = function(marker, anchorLocation) {
		// jshint unused:vars
	};

	MapApiProviderBase.prototype._onMapReady = function() {
		this.trigger("mapReady");
	};

	MapApiProviderBase.prototype._onMapClicked = function() {
		this.trigger("mapClicked");
	};

	MapApiProviderBase.prototype._onMapMoved = function(newMapExtent) {
		this.trigger("mapMoved", newMapExtent);
	};

	MapApiProviderBase.prototype._onMarkerClicked = function(marker, clickedLocation) {
		this.trigger("markerClicked", marker, clickedLocation);
	};

	MapApiProviderBase.prototype._onPointMarkerCreated = function(location) {
		this.trigger("pointMarkerCreated", location, this._currPointSymbol);
	};

	MapApiProviderBase.prototype._onPolylineMarkerCreated = function(locations) {
		this.trigger("polylineMarkerCreated", locations, this._currPolylineSymbol);
	};

	MapApiProviderBase.prototype._onPolygonMarkerCreated = function(locations) {
		this.trigger("polygonMarkerCreated", locations, this._currPolygonSymbol);
	};

	observable(MapApiProviderBase.prototype);

	return MapApiProviderBase;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.MapApiProviderBase;
}
