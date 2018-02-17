var loggingServiceFactory = require("./logging/factories/loggingServiceFactory");

var loggingService = loggingServiceFactory.create();

var Stopwatch = function(operation) {
	"use strict";

	this.operation = operation || "Operation";
	this.startTime = 0;

	this.start = function() {
		this.startTime = (new Date()).getTime();
	};

	this.stop = function() {
		if(this.startTime) {
			var time = (new Date()).getTime() - this.startTime;
			this.startTime = 0;
			loggingService.trace(this.operation + " took " + time + "ms.");
		}
	};

	this.start();
};

exports.Stopwatch = Stopwatch;
