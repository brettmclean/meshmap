meshmap.namespace("meshmap.startup");

meshmap.startup.startupParametersService = (function() {

	// imports
	var queryStringParser = meshmap.utils.queryStringParser;

	var getStartupParameters = function() {

		if(location && typeof location.search === "string") {
			return getQueryStringParameters();
		}

		return {};
	};

	var getQueryStringParameters = function() {
		var queryString = location.search.slice(1);
		return queryStringParser.parse(queryString);
	};

	return {
		getStartupParameters: getStartupParameters
	};
}());
