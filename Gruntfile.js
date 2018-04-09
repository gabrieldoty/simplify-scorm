module.exports = function(grunt) {
  var src = ["src/init.js", "src/constants.js", "src/jsonFormatter.js", "src/baseAPI.js", "src/scormAPI.js"];

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    concat: {
      options: {
        banner: "/*! <%= pkg.name %> v<%= pkg.version %> - <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
      dist: {
        src: src,
        dest: "build/scormAPI.js"
      }
    },
    eslint: {
      src: src
    }
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("gruntify-eslint");

  grunt.registerTask("default", ["eslint", "concat:dist"]);
};
