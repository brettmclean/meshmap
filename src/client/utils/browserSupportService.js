meshmap.namespace("meshmap.utils");

meshmap.utils.browserSupportService = (function() {
	var browserSupportsInputType = function(type) {
		var el = document.createElement("input");
		el.setAttribute("type", type);
		return el.type === type;
	};

	var browserSupportsRangeInputs = function() {
		return browserSupportsInputType("range");
	};

	return {
		rangeInput: browserSupportsRangeInputs()
	};
}());
