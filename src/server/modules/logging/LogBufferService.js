var LogBufferService = function() {
	this._entryQueue = [];
};

LogBufferService.prototype.queueEntry = function(logEntry) {
	this._entryQueue.push(logEntry);
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
