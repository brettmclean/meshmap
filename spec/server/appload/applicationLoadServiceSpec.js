require("../testUtils/init");
var loader = require("../testUtils/loader");

var ApplicationLoadService = loader.load("appload/ApplicationLoadService");

describe("An application load service", function() {

	describe("init method", function() {

		it("exists", function() {
			var als = new ApplicationLoadService();

			expect(typeof als.init).toBe("function");
		});

	});

	describe("setConfig method", function() {

		it("exists", function() {
			var als = new ApplicationLoadService();

			expect(typeof als.setConfig).toBe("function");
		});

	});

	describe("appIsOverloaded method", function() {

		it("exists", function() {
			var als = new ApplicationLoadService();

			expect(typeof als.appIsOverloaded).toBe("function");
		});

	});

	describe("shutdown method", function() {

		it("exists", function() {
			var als = new ApplicationLoadService();

			expect(typeof als.shutdown).toBe("function");
		});

	});

});
