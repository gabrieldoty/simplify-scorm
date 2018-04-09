module.exports = function(grunt) {
  var banner = "/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> */";
  var src = ["src/init.js", "src/constants.js", "src/jsonFormatter.js", "src/baseAPI.js", "src/scormAPI.js"];

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        banner: banner + "\n\n"
      },
      dist: {
        src: src,
        dest: "build/scormAPI.js"
      }
    },
    eslint: {
      src: src
    },
    uglify: {
      options: {
        banner: banner
      },
      dist: {
        files: {
          "build/scormAPI.min.js": src
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("gruntify-eslint");

  grunt.registerTask("default", ["eslint", "concat:dist", "uglify:dist"]);
};
