module.exports = function(grunt) {
  var banner = "/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> */";
  var srcFiles = ["src/init.js", "src/constants.js", "src/jsonFormatter.js", "src/baseAPI.js", "src/scormAPI.js", "src/scormAPI2004.js"];
  var testFiles = srcFiles.concat("test/**/*.js");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        banner: banner + "\n\n"
      },
      dist: {
        src: srcFiles,
        dest: "build/scormAPI.js"
      }
    },
    eslint: {
      dist: srcFiles
    },
    karma: {
      options: {
        browsers: ["ChromeHeadless"],
        files: testFiles,
        frameworks: ["mocha", "sinon-chai"],
        reporters: ["dots"]
      },
      dev: {},
      dist: {
        singleRun: true
      }
    },
    uglify: {
      options: {
        banner: banner
      },
      dist: {
        files: {
          "build/scormAPI.min.js": srcFiles
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("gruntify-eslint");

  grunt.registerTask("build", ["concat:dist", "uglify:dist"]);
  grunt.registerTask("test", ["eslint:dist", "karma:dist"]);
  grunt.registerTask("watch", ["karma:dev"]);

  grunt.registerTask("default", ["test", "build"]);
};
