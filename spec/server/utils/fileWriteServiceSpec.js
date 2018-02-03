require("../testUtils/init");
var loader = require("../testUtils/loader");

var FileWriteService = loader.load("utils/FileWriteService");

describe("A file write service", function() {

	describe("ensureDirectoryExists method", function() {

		it("exists", function() {
			var fws = new FileWriteService();

			expect(typeof fws.ensureDirectoryExists).toBe("function");
		});

	});

	describe("appendUtf8StringToFile method", function() {

		it("exists", function() {
			var fws = new FileWriteService();

			expect(typeof fws.appendUtf8StringToFile).toBe("function");
		});

	});

});
