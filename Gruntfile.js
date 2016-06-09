module.exports = function (grunt) {
	"use strict";

	grunt.initConfig({

		pkg: grunt.file.readJSON("package.json"),

		clean: ["dist"],

		uglify: {
			options: {
				enclose: {},
				compress: {
					//drop_console: true
				}
			},
			dist: {
				files: [{
					expand: true,
					cwd: "src",
					src: ["server.js", "client.js"],
					dest: "dist",
					ext: ".js"
				}]
			}
		},

		compress: {
			dist: {
				options: {
					archive: "dist.zip"
				},
				files: [{
					cwd: "dist",
					expand: true,
					src: ["*"],
					filter: "isFile"
				}]
			}
		},

		sync: {
			dist: {
				files: [{
					cwd: "src",
					expand: true,
					src: ["index.html"],
					dest: "dist"
				}],
				verbose: true
			}
		},

		watch: {
            sync: {
				files: ["src/*.html"],
				tasks: ["sync", "compress", "express"],
				options: {
					spawn: false
				}
			},
            uglify: {
				files: ["src/*.js"],
				tasks: ["uglify", "compress", "express"],
				options: {
					spawn: false
				}
			}
		},

		express: {
  			dev: {
				options: {
    				script: 'index.js'
				}
  			}
		}

	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-compress");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-express-server");
	grunt.loadNpmTasks("grunt-sync");
	grunt.registerTask("default", ["clean", "sync", "uglify", "compress", "express", "watch"]);
};