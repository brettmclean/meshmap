require("../testUtils/init");
var loader = require("../testUtils/loader");

var LoggingService = loader.load("logging/LoggingService");

describe("A logging service", function() {

	describe("init method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.init).toBe("function");
		});
	});

	describe("setConfig method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.setConfig).toBe("function");
		});
	});

	describe("info method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.info).toBe("function");
		});
	});

	describe("shutdown method", function() {
		it("exists", function() {
			var ls = createLoggingService();

			expect(typeof ls.shutdown).toBe("function");
		});
	});

});

function createLoggingService() {
	var ls = new LoggingService();
	return ls;
}
