module.exports = function(grunt) {
	"use strict";

	var dependencyResolver = require("./scripts/js-deps/dependencyResolver");

	var pkg = grunt.file.readJSON("package.json");

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');

	var clientJsSrcs = getClientJsSrcs();

	grunt.registerTask("writeAppMetadata", doWriteAppMetadata);
	grunt.registerTask("writeVersion", doWriteVersionFile);
	grunt.registerTask("genDevJsLoader", doGenerateDevelopmentJsLoader);
	grunt.registerTask("reloadDelay", doReloadDelay);

	grunt.registerTask("default", ["writeAppMetadata", "ngtemplates:default", "copy", "genDevJsLoader", "writeVersion"]);
	grunt.registerTask("dev", ["default", "concurrent:dev"]);
	grunt.registerTask("release", ["clean", "writeAppMetadata", "ngtemplates:release",
		"concat:release", "uglify", "copy:release", "cssmin", "writeVersion"]);

	grunt.initConfig({
		pkg: pkg,
		concat: getConcatConfig(),
		uglify: getUglifyConfig(),
		clean: getCleanConfig(),
		copy: getCopyConfig(),
		cssmin: getCssMinConfig(),
		ngtemplates: getAngularTemplatesConfig(),
		concurrent: getConcurrentConfig(),
		nodemon: getNodemonConfig(),
		watch: getWatchConfig()
	});

	function getConcatConfig() {
		return {
			release: {
				src: clientJsSrcs,
				dest: "build/meshmap.js"
			}
		};
	}

	function getUglifyConfig() {
		return {
			default: {
				options: {
					banner: "/*!\n<%= pkg.title %> v<%= pkg.version %>\n" +
							"Copyright 2013-<%= grunt.template.today('yyyy') %>, <%= pkg.contributors[0].name %> and other contributors\n" +
							"Licensed under <%= pkg.license %>\n\n" +
							"Build date: <%= grunt.template.today('UTC:yyyy-mm-dd HH:MM:ss Z') %>\n*/\n\n",
				},
				files: {
					"build/meshmap.js": "build/meshmap.js"
				}
			}
		};
	}

	function getCleanConfig() {
		return {
			default: ["build/", "app/"]
		};
	}

	function getCopyConfig() {
		var serverSrcItem = {expand: true, cwd: "src/server/", src: ["index.js", "modules/**"], dest: "app/"};
		var clientSrcItem = {expand: true, cwd: "src/client/", src: ["**/*.js", "!dev-loader.js"], dest: "app/web/js/"};
		var clientWebItem = {expand: true, cwd: "src/client/web/", src: ["**"], dest: "app/web/"};
		var configItem = {expand: true, cwd: "config/", src: ["*"], dest: "app/config/"};
		var buildItem = {
			default: {expand: true, cwd: "build", src: ["metadata.js", "templates.js"], dest: "app/web/js/"},
			release: {expand: true, cwd: "build", src: ["meshmap.js"], dest: "app/web/js/"}
		};

		return {
			default: {
				files: [serverSrcItem, clientSrcItem, clientWebItem, configItem, buildItem.default]
			},
			release: {
				files: [serverSrcItem, clientWebItem, configItem, buildItem.release]
			}
		};
	}

	function getCssMinConfig() {
		return {
			default: {
				expand: true,
				cwd: "app/web/css",
				src: ["*.css"],
				dest: "app/web/css"
			}
		};
	}

	function getAngularTemplatesConfig() {
		return {
			default: {
				src: [
					"src/client/**/*.html",
					"!src/client/web/**"
				],
				dest: "build/templates.js",
				options: {
					module: "meshmap.app",
					url: function(url) {
						return url.replace(/^(.+)\//, "html/partials/");
					}
				}
			},
			release: {
				src: [
					"src/client/**/*.html",
					"!src/client/web/**"
				],
				dest: "build/templates.js",
				options: {
					concat: "release",
					htmlmin: {
						collapseWhitespace: true,
						removeComments: true,
						keepClosingSlash: true
					},
					module: "meshmap.app",
					url: function(url) {
						return url.replace(/^(.+)\//, "html/partials/");
					}
				}
			}
		};
	}

	function getConcurrentConfig() {
		return {
			dev: {
				tasks: ['nodemon', 'watch'],
				options: {
					logConcurrentOutput: true
				}
			}
		};
	}

	function getNodemonConfig() {
		return {
			dev: {
				script: 'app',
				options: {
					watch: ["src/**/*.js"],
					delay: 500
				}
			}
		};
	}

	function getWatchConfig() {
		return {
			scripts: {
				files: ["src/**/*", "Gruntfile.js"],
				tasks: ["default", "reloadDelay"],
				options: {
					spawn: false,
					livereload: true
				}
			}
		};
	}

	function getClientJsSrcs() {
		var depFiles = dependencyResolver.flattenToFileList("scripts/js-deps/clientJsDeps.json")
			.map(function(jsFile) {
				return "src/client/" + jsFile + ".js";
			});

		var srcs = ["src/client/index.js"]
			.concat(depFiles)
			.concat(["src/client/angular/app.js", "src/client/**/*.js",
			"build/metadata.js", "!src/client/dev-loader.js", "!src/client/web/**"]);
		return srcs;
	}

	function doWriteAppMetadata() {
		var appMetadata = {
			name: pkg.title ? pkg.title : pkg.name,
			description: pkg.description,
			version: pkg.version,
			license: pkg.license
		};

		var fileContent = "meshmap.metadata = " + JSON.stringify(appMetadata, null, "\t") + ";"
		grunt.file.write("build/metadata.js", fileContent);
	}

	function doWriteVersionFile() {
		var fileContent = "module.exports = \"" + pkg.version + "\";";
		grunt.file.write("app/modules/version.js", fileContent);
	}

	function doGenerateDevelopmentJsLoader() {
		var expandedFilePaths = grunt.file.expand({}, clientJsSrcs);

		var webFilePaths = expandedFilePaths.map(function(filePath) {
			return filePath.replace(/^(build|src\/client)/, "js");
		});
		webFilePaths.push("js/templates.js");

		var devLoaderJs = "var files = " + JSON.stringify(webFilePaths) + ";\n\n";
		devLoaderJs += grunt.file.read("src/client/dev-loader.js");

		grunt.file.write("app/web/js/meshmap.js", devLoaderJs);
	}

	function doReloadDelay() {
		var done = this.async();
		setTimeout(done, 1000);
	}
};
