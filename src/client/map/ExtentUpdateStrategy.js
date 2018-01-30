meshmap.namespace("meshmap.map");

meshmap.map.ExtentUpdateStrategy = (function() {

	// imports
	var dm = meshmap.models;

	var SCORE_THRESHOLD = 1.0;
	var MAX_TIME_MS = 10 * 1000;

	var ExtentUpdateStrategy = function() {

	};

	ExtentUpdateStrategy.prototype.extentIsOutdated = function(lastExtent, currExtent, msSinceLastUpdate) {
		validate(lastExtent, currExtent, msSinceLastUpdate);

		return currExtentOutdated(lastExtent, currExtent, msSinceLastUpdate);
	};

	var validate = function(lastExtent, currExtent, msSinceLastUpdate) {
		if(lastExtent) {
			validateExtent(lastExtent);
		}
		if(currExtent) {
			validateExtent(currExtent);
		}
		if(msSinceLastUpdate) {
			validateMilliseconds(msSinceLastUpdate);
		}
	};

	var validateExtent = function(mapExtent) {
		if(!(mapExtent instanceof dm.MapExtent)) {
			throw new TypeError("Provided extent(s) must be valid MapExtent");
		}
	};

	var validateMilliseconds = function(milliseconds) {
		if(typeof milliseconds !== "number") {
			throw new TypeError("Provided milliseconds must be a number");
		}
		if(milliseconds < 0) {
			throw new RangeError("Provided milliseconds must not be negative");
		}
	};

	var currExtentOutdated = function(lastExtent, currExtent, msSinceLastUpdate) {
		if(!currExtent) {
			return false;
		}
		if(isFirstExtentUpdate(lastExtent, currExtent)) {
			return true;
		}

		var score = getScore(lastExtent, currExtent, msSinceLastUpdate);
		return score > SCORE_THRESHOLD;
	};

	var isFirstExtentUpdate = function(lastExtent, currExtent) {
		return !lastExtent && !!currExtent;
	};

	var getScore = function(lastExtent, currExtent, msSinceLastUpdate) {
		var extentChangeScore = getExtentChangeScore(lastExtent, currExtent);
		var timeScore = getTimeScore(msSinceLastUpdate);
		return extentChangeScore + timeScore;
	};

	var getExtentChangeScore = function(before, after) {
		var latHeightBefore = before.max.lat - before.min.lat;
		var lngWidthBefore = before.max.lng - before.min.lng;

		var latPercChange = Math.abs(after.min.lat - before.min.lat) / latHeightBefore;
		var lngPercChange = Math.abs(after.min.lng - before.min.lng) / lngWidthBefore;

		var score = latPercChange + lngPercChange;
		return score;
	};

	var getTimeScore = function(msSinceLastUpdate) {
		msSinceLastUpdate = msSinceLastUpdate || 0;
		return msSinceLastUpdate / MAX_TIME_MS;
	};

	return ExtentUpdateStrategy;

}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.map.ExtentUpdateStrategy;
}
