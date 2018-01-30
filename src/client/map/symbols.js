meshmap.namespace("meshmap.map");

meshmap.map.symbols = (function() {

	var PointSymbol = function(iconId) {
		this.iconId = iconId;
	};

	var PolylineSymbol = function(lineColorId, lineWidth) {
		this.lineColorId = lineColorId;
		this.lineWidth = lineWidth;
	};

	var PolygonSymbol = function(lineColorId, fillColorId, lineWidth) {
		this.lineColorId = lineColorId;
		this.fillColorId = fillColorId;
		this.lineWidth = lineWidth;
	};

	return {
		PointSymbol: PointSymbol,
		PolylineSymbol: PolylineSymbol,
		PolygonSymbol: PolygonSymbol
	};

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.symbols;
}
