var ConsoleOutputService = function() {

};

ConsoleOutputService.prototype.error = function(message) {
	console.error(message);
};
ConsoleOutputService.prototype.warn = function(message) {
	console.warn(message);
};
ConsoleOutputService.prototype.info = function(message) {
	console.info(message);
};
ConsoleOutputService.prototype.debug = function(message) {
	console.debug(message);
};

module.exports = ConsoleOutputService;
