meshmap.namespace("meshmap.map");

meshmap.map.MarkerSelectionContext = (function() {

	// imports
	var observable = MicroEvent.mixin,
		symbols = meshmap.map.symbols;

	var LAYOUT_LARGE = "large";
	var LAYOUT_SMALL = "small";

	var TOOL_PAN = "pan";
	var TOOL_POINT = "point";
	var TOOL_POLYLINE = "polyline";
	var TOOL_POLYGON = "polygon";

	function MarkerSelectionContext() {
		this.large = false;
		this.small = false;

		this.markerIconOptions = [];
		this.markerColorOptions = [];

		this.activePointSymbolIcon = new PointSymbolInfo();
		this.activePolylineSymbol = new PolylineSymbolInfo();
		this.activePolygonSymbol = new PolygonSymbolInfo();

		this._activeTool = TOOL_PAN;
		this._showingOptionsForTool = null;
		this._toolDrawerOpen = true;
	}
	MarkerSelectionContext.prototype = {
		TOOL_PAN: TOOL_PAN,
		TOOL_POINT: TOOL_POINT,
		TOOL_POLYLINE: TOOL_POLYLINE,
		TOOL_POLYGON: TOOL_POLYGON
	};

	MarkerSelectionContext.prototype.setLayout = function(layout) {
		this.large = layout === LAYOUT_LARGE;
		this.small = layout === LAYOUT_SMALL;

		this._toolDrawerOpen = this.large;
	};

	MarkerSelectionContext.prototype.toolDrawerIsOpen = function() {
		return this._toolDrawerOpen;
	};

	MarkerSelectionContext.prototype.activeToolHasAvailableOptions = function() {
		return this.pointToolIsActive() || this.polylineToolIsActive() || this.polygonToolIsActive();
	};

	MarkerSelectionContext.prototype.setMarkerIcons = function(markerIcons) {
		this.markerIconOptions = Object.keys(markerIcons).map(function(key) {
			var iconId = parseInt(key);
			return new MarkerIconOption(iconId, markerIcons[iconId]);
		});
		this.selectPointIcon(this.markerIconOptions[0]);
	};

	MarkerSelectionContext.prototype.setMarkerColors = function(markerColors) {
		this.markerColorOptions = Object.keys(markerColors).map(function(key) {
			var colorId = parseInt(key);
			return new MarkerColorOption(colorId, markerColors[colorId]);
		});
		this._onPolylineColorChanged(this.markerColorOptions[0]);
		this._onPolygonLineColorChanged(this.markerColorOptions[0]);
		this._onPolygonFillColorChanged(this.markerColorOptions[0]);
	};

	MarkerSelectionContext.prototype.selectTool = function(tool) {
		if(this.small) {
			this._toolDrawerOpen = !this._toolDrawerOpen;
			this.hideToolOptions();
		}
		this.setActiveTool(tool);
	};

	MarkerSelectionContext.prototype.setActiveTool = function(activeTool) {
		if(this._activeTool !== activeTool) {
			this._activeTool = activeTool;
			this.hideToolOptions();
			this._onToolChanged(activeTool);
		}
	};

	MarkerSelectionContext.prototype.panToolIsActive = function() {
		return this._activeTool === TOOL_PAN;
	};

	MarkerSelectionContext.prototype.pointToolIsActive = function() {
		return this._activeTool === TOOL_POINT;
	};

	MarkerSelectionContext.prototype.polylineToolIsActive = function() {
		return this._activeTool === TOOL_POLYLINE;
	};

	MarkerSelectionContext.prototype.polygonToolIsActive = function() {
		return this._activeTool === TOOL_POLYGON;
	};

	MarkerSelectionContext.prototype.toggleOptionsForTool = function(tool) {
		var toolOptionsAlreadyShowing = this._showingOptionsForTool === tool;
		if(toolOptionsAlreadyShowing) {
			this.hideToolOptions();
		} else {
			this.setActiveTool(tool);
			this._showingOptionsForTool = tool;
		}
	};

	MarkerSelectionContext.prototype.toggleOptionsForActiveTool = function() {
		this._toolDrawerOpen = false;
		this.toggleOptionsForTool(this._activeTool);
	};

	MarkerSelectionContext.prototype.hideToolOptions = function() {
		this._showingOptionsForTool = null;
	};

	MarkerSelectionContext.prototype.pointToolOptionsAreVisible = function() {
		return this._showingOptionsForTool === TOOL_POINT;
	};

	MarkerSelectionContext.prototype.polylineToolOptionsAreVisible = function() {
		return this._showingOptionsForTool === TOOL_POLYLINE;
	};

	MarkerSelectionContext.prototype.polygonToolOptionsAreVisible = function() {
		return this._showingOptionsForTool === TOOL_POLYGON;
	};

	MarkerSelectionContext.prototype.toolOptionsAreVisible = function() {
		return this.pointToolOptionsAreVisible() || this.polylineToolOptionsAreVisible() || this.polygonToolOptionsAreVisible();
	};

	MarkerSelectionContext.prototype.selectPointIcon = function(markerIconOption) {
		var iconAlreadySelected = this.activePointSymbolIcon.iconId === markerIconOption.iconId;
		if(!iconAlreadySelected) {
			this._onPointSymbolChanged(markerIconOption);
		} else {
			this.hideToolOptions();
		}
	};

	MarkerSelectionContext.prototype.selectPolylineColor = function(markerColorOption) {
		var colorAlreadySelected = this.activePolylineSymbol.lineColorId === markerColorOption.colorId;
		if(!colorAlreadySelected) {
			this._onPolylineColorChanged(markerColorOption);
		} else {
			this.hideToolOptions();
		}
	};

	MarkerSelectionContext.prototype.setPolylineWidth = function(lineWidth) {
		lineWidth = parseInt(lineWidth);
		this._onPolylineWidthChanged(lineWidth);
	};

	MarkerSelectionContext.prototype.selectPolygonLineColor = function(markerColorOption) {
		var colorAlreadySelected = this.activePolygonSymbol.lineColorId === markerColorOption.colorId;
		if(!colorAlreadySelected) {
			this._onPolygonLineColorChanged(markerColorOption);
		} else {
			this.hideToolOptions();
		}
	};

	MarkerSelectionContext.prototype.selectPolygonFillColor = function(markerColorOption) {
		var colorAlreadySelected = this.activePolygonSymbol.fillColorId === markerColorOption.colorId;
		if(!colorAlreadySelected) {
			this._onPolygonFillColorChanged(markerColorOption);
		} else {
			this.hideToolOptions();
		}
	};

	MarkerSelectionContext.prototype.setPolygonLineWidth = function(lineWidth) {
		lineWidth = parseInt(lineWidth);
		this._onPolygonLineWidthChanged(lineWidth);
	};

	MarkerSelectionContext.prototype._onToolChanged = function(activeTool) {
		this.trigger("toolChanged", activeTool);
	};

	MarkerSelectionContext.prototype._onPointSymbolChanged = function(markerIconOption) {
		this.activePointSymbolIcon.iconId = markerIconOption.iconId;
		this.activePointSymbolIcon.iconUrl = markerIconOption.iconUrl;

		var pointSymbol = new symbols.PointSymbol(markerIconOption.iconId);
		this.trigger("pointSymbolChanged", pointSymbol);
	};

	MarkerSelectionContext.prototype._onPolylineColorChanged = function(markerColorOption) {
		this.activePolylineSymbol.lineColorId = markerColorOption.colorId;
		this.activePolylineSymbol.lineColor = markerColorOption.color;

		var polylineSymbol = this._convertPolylineSymbolInfoToPolylineSymbol(this.activePolylineSymbol);
		this.trigger("polylineSymbolChanged", polylineSymbol);
	};

	MarkerSelectionContext.prototype._onPolylineWidthChanged = function(lineWidth) {
		this.activePolylineSymbol.lineWidth = lineWidth;

		var polylineSymbol = this._convertPolylineSymbolInfoToPolylineSymbol(this.activePolylineSymbol);
		this.trigger("polylineSymbolChanged", polylineSymbol);
	};

	MarkerSelectionContext.prototype._onPolygonLineColorChanged = function(markerColorOption) {
		this.activePolygonSymbol.lineColorId = markerColorOption.colorId;
		this.activePolygonSymbol.lineColor = markerColorOption.color;

		var polygonSymbol = this._convertPolygonSymbolInfoToPolygonSymbol(this.activePolygonSymbol);
		this.trigger("polygonSymbolChanged", polygonSymbol);
	};

	MarkerSelectionContext.prototype._onPolygonFillColorChanged = function(markerColorOption) {
		this.activePolygonSymbol.fillColorId = markerColorOption.colorId;
		this.activePolygonSymbol.fillColor = markerColorOption.color;

		var polygonSymbol = this._convertPolygonSymbolInfoToPolygonSymbol(this.activePolygonSymbol);
		this.trigger("polygonSymbolChanged", polygonSymbol);
	};

	MarkerSelectionContext.prototype._onPolygonLineWidthChanged = function(lineWidth) {
		this.activePolygonSymbol.lineWidth = lineWidth;

		var polygonSymbol = this._convertPolygonSymbolInfoToPolygonSymbol(this.activePolygonSymbol);
		this.trigger("polygonSymbolChanged", polygonSymbol);
	};

	MarkerSelectionContext.prototype._convertPolylineSymbolInfoToPolylineSymbol = function(polylineSymbolInfo) {
		return new symbols.PolylineSymbol(
			polylineSymbolInfo.lineColorId,
			polylineSymbolInfo.lineWidth
		);
	};

	MarkerSelectionContext.prototype._convertPolygonSymbolInfoToPolygonSymbol = function(polygonSymbolInfo) {
		return new symbols.PolygonSymbol(
			polygonSymbolInfo.lineColorId,
			polygonSymbolInfo.fillColorId,
			polygonSymbolInfo.lineWidth
		);
	};

	var MarkerIconOption = function(iconId, iconUrl) {
		this.iconId = iconId;
		this.iconUrl = iconUrl;
	};

	var MarkerColorOption = function(colorId, color) {
		this.colorId = colorId;
		this.color = color;
	};

	var PointSymbolInfo = function() {
		this.iconId = 0;
		this.iconUrl = "";
	};

	var PolylineSymbolInfo = function() {
		this.lineColorId = 0;
		this.lineColor = "";
		this.lineWidth = 2;
	};

	var PolygonSymbolInfo = function() {
		this.lineColorId = 0;
		this.lineColor = "";
		this.fillColorId = 0;
		this.fillColor = "";
		this.lineWidth = 2;
	};

	observable(MarkerSelectionContext.prototype);

	return MarkerSelectionContext;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.MarkerSelectionContext;
}
