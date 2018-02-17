var ConsoleOutputService = function() {

};

ConsoleOutputService.prototype.error = function(message) {
	console.log(message);
};
ConsoleOutputService.prototype.warn = function(message) {
	console.log(message);
};
ConsoleOutputService.prototype.info = function(message) {
	console.log(message);
};
ConsoleOutputService.prototype.debug = function(message) {
	console.log(message);
};

module.exports = ConsoleOutputService;
