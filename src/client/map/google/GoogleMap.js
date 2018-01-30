meshmap.namespace("meshmap.map.google");

meshmap.map.google.GoogleMap = (function() {

	// imports
	var MapBase = meshmap.map.MapBase;

	var baseClass = MapBase,
		baseProto = baseClass.prototype;
	var GoogleMap = function(opts, deps) {
		baseClass.call(this, opts, deps);
	};
	GoogleMap.prototype = Object.create(baseProto);
	GoogleMap.prototype.constructor = GoogleMap;

	GoogleMap.prototype.getScriptUrls = function() {
		var urls = baseProto.getScriptUrls.call(this);

		var url = "//maps.googleapis.com/maps/api/js";
		url += "?v=3.30";
		url += "&libraries=drawing";
		if(this._key) {
			url += "&key=" + this._key;
		}
		urls.push(url);

		return urls;
	};

	GoogleMap.prototype.getMapTypeDescription = function() {
		return "Google";
	};

	return GoogleMap;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.google.GoogleMap;
}
