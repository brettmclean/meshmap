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

var LogEntry = function(level, message) {
	this.level = level;
	this.message = message;
};

module.exports = LogBufferService;
