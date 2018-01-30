meshmap.namespace("meshmap.utils");

meshmap.utils.queryStringParser = (function() {

	var parse = function(queryString) {
		var pairs = queryString.split("&");

		var result = {};
		for(var i = 0; i < pairs.length; i++) {
			var pair = pairs[i];
			if(pair) {
				pair = pair.split("=");
				result[pair[0]] = decodeURIComponent(pair[1] || "");
			}
		}

		return result;
	};

	return {
		parse: parse
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.queryStringParser;
}
