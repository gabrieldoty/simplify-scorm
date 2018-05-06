(function() {
  "use strict";

  describe("constants", function() {
    var constants = window.simplifyScorm.constants;

    it("should define SCORM_TRUE", function() {
      expect(constants.SCORM_TRUE).to.equal("true");
    });

    it("should define SCORM_FALSE", function() {
      expect(constants.SCORM_FALSE).to.equal("false");
    });

    it("should define STATE_NOT_INITIALIZED", function() {
      expect(constants.STATE_NOT_INITIALIZED).to.equal(0);
    });

    it("should define STATE_INITIALIZED", function() {
      expect(constants.STATE_INITIALIZED).to.equal(1);
    });

    it("should define STATE_TERMINATED", function() {
      expect(constants.STATE_TERMINATED).to.equal(2);
    });

    it("should define LOG_LEVEL_DEBUG", function() {
      expect(constants.LOG_LEVEL_DEBUG).to.equal(1);
    });

    it("should define LOG_LEVEL_INFO", function() {
      expect(constants.LOG_LEVEL_INFO).to.equal(2);
    });

    it("should define LOG_LEVEL_WARNING", function() {
      expect(constants.LOG_LEVEL_WARNING).to.equal(3);
    });

    it("should define LOG_LEVEL_ERROR", function() {
      expect(constants.LOG_LEVEL_ERROR).to.equal(4);
    });

    it("should define LOG_LEVEL_NONE", function() {
      expect(constants.LOG_LEVEL_NONE).to.equal(5);
    });
  });
})();
