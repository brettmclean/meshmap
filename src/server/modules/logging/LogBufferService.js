var LogEntry = require("./LogEntry");

var LogBufferService = function() {
	this._entryQueue = [];
};

LogBufferService.prototype.queueEntry = function(level, message) {
	this._entryQueue.push(new LogEntry(level, message));
};

LogBufferService.prototype.dequeueAndClearEntries = function() {
	var entries = this._entryQueue;
	this._entryQueue = [];
	return entries;
};

LogBufferService.prototype.hasEntries = function() {
	return this._entryQueue.length > 0;
};

module.exports = LogBufferService;
