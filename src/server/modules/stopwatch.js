var logger = require("./logger");

var Stopwatch = function(/* String */ operation) {
	"use strict";

	this.operation = operation || "Operation";
	this.startTime = 0;

	this.start = function() {
		this.startTime =  (new Date()).getTime();
	};

	this.stop = function() {
		if(this.startTime) {
			var time = (new Date()).getTime() - this.startTime;
			this.startTime = 0;
			logger.trace(this.operation + " took " + time + "ms.");
		}
	};

	this.start();
};

exports.Stopwatch = Stopwatch;
