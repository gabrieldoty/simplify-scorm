(function() {
  "use strict";

  describe("scormAPI2004", function() {
    var originalFunctions = {};
    var api;

    beforeEach(function() {
      api = new window.simplifyScorm.ScormAPI2004();

      originalFunctions["console.error"] = console.error;
      originalFunctions["console.info"] = console.info;
      originalFunctions["console.warn"] = console.warn;
      console.error = sinon.stub();
      console.info = sinon.stub();
      console.warn = sinon.stub();
    });

    describe("#cmi", function() {
      describe("completion_status", function() {
        context("when completion_threshold is not defined", function() {
          it("should return _completion_status value", function() {
            expect(api.cmi.completion_status).to.equal(api.cmi._completion_status);
          });
        });

        context("when completion_threshold is defined", function() {
          beforeEach(function() {
            api.cmi.completion_threshold = 0.5;
          });

          context("when progress_measure is undefined", function() {
            it("should return unknown", function() {
              expect(api.cmi.completion_status).to.equal("unknown");
            });
          });

          context("when progress_measure is greater than completion_threshold", function() {
            beforeEach(function() {
              api.cmi.progress_measure = 0.6;
            });

            it("should return completed", function() {
              expect(api.cmi.completion_status).to.equal("completed");
            });
          });

          context("when progress_measure is equal to completion_threshold", function() {
            beforeEach(function() {
              api.cmi.progress_measure = 0.5;
            });

            it("should return completed", function() {
              expect(api.cmi.completion_status).to.equal("completed");
            });
          });

          context("when progress_measure is lesser than completion_threshold", function() {
            beforeEach(function() {
              api.cmi.progress_measure = 0.4;
            });

            it("should return incomplete", function() {
              expect(api.cmi.completion_status).to.equal("incomplete");
            });
          });
        });
      });

      describe("success_status", function() {
        context("when scaled_passing_score is not defined", function() {
          it("should return _success_status value", function() {
            expect(api.cmi.success_status).to.equal(api.cmi._success_status);
          });
        });

        context("when scaled_passing_score is defined", function() {
          beforeEach(function() {
            api.cmi.scaled_passing_score = 0.5;
          });

          context("when score.scaled is undefined", function() {
            it("should return unknown", function() {
              expect(api.cmi.success_status).to.equal("unknown");
            });
          });

          context("when score.scaled is greater than scaled_passing_score", function() {
            beforeEach(function() {
              api.cmi.score.scaled = 0.6;
            });

            it("should return passed", function() {
              expect(api.cmi.success_status).to.equal("passed");
            });
          });

          context("when score.scaled is equal to scaled_passing_score", function() {
            beforeEach(function() {
              api.cmi.score.scaled = 0.5;
            });

            it("should return passed", function() {
              expect(api.cmi.success_status).to.equal("passed");
            });
          });

          context("when score.scaled is lesser than scaled_passing_score", function() {
            beforeEach(function() {
              api.cmi.score.scaled = 0.4;
            });

            it("should return failed", function() {
              expect(api.cmi.success_status).to.equal("failed");
            });
          });
        });
      });
    });
  });
})();
