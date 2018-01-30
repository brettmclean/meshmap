meshmap.namespace("meshmap.utils");

meshmap.utils.dateTimeFormatter = (function() {

	var padWithLeadingZeros = function(num, desiredLength) {
		var result = num + "";

		while(result.length < desiredLength) {
			result = "0" + result;
		}

		return result;
	};

	var formatDate = function(date) {
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		var dayOfMonth = date.getDate();

		month = padWithLeadingZeros(month, 2);
		dayOfMonth = padWithLeadingZeros(dayOfMonth, 2);

		return year + "-" + month + "-" + dayOfMonth;
	};

	var formatTime = function(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = date.getSeconds();
		var milliseconds = date.getMilliseconds();

		hours = padWithLeadingZeros(hours, 2);
		minutes = padWithLeadingZeros(minutes, 2);
		seconds = padWithLeadingZeros(seconds, 2);
		milliseconds = padWithLeadingZeros(milliseconds, 3);

		return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
	};

	var formatDateAndTime = function(date) {
		date = date || new Date();

		var dateStr = formatDate(date);
		var timeStr = formatTime(date);

		return dateStr + " " + timeStr;
	};

	return {
		formatDateAndTime: formatDateAndTime
	};
}());

/* istanbul ignore else  */
if(typeof module !== "undefined" && module.exports) {
	module.exports = meshmap.utils.dateTimeFormatter;
}
