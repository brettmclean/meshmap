require("../testUtils/init");
var loader = require("../testUtils/loader");

var FileReadService = loader.load("utils/FileReadService");

describe("A file read service", function() {

	describe("readAsUtf8StringSync method", function() {

		it("exists", function() {
			var frs = new FileReadService();

			expect(typeof frs.readAsUtf8StringSync).toBe("function");
		});

	});

});
