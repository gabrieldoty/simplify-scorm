module.exports = function(grunt) {
  var banner = "/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> */";
  var srcFiles = ["src/init.js", "src/constants.js", "src/jsonFormatter.js", "src/baseAPI.js", "src/scormAPI.js"];
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
      src: srcFiles
    },
    karma: {
      options: {
        browsers: ["ChromeHeadless"],
        files: testFiles,
        frameworks: ["mocha", "sinon-chai"],
        reporters: ["dots"]
      },
      dist: {
        singleRun: true
      },
      unit: {}
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

  grunt.registerTask("default", ["eslint", "karma:dist", "concat:dist", "uglify:dist"]);
  grunt.registerTask("test", ["karma:unit"]);
};
