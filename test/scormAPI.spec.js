(function() {
  "use strict";

  describe("scormAPI", function() {
    var api, constants, listener, result;

    beforeEach(function() {
      api = new window.simplifyScorm.ScormAPI();
      api.apiLog = sinon.stub();
      sinon.spy(api, "throwSCORMError");

      constants = window.simplifyScorm.constants;
      listener = sinon.stub();
    });

    context("initially", function() {
      it("should create a global instance of itself", function() {
        expect(window.API).to.be.an.instanceof(window.simplifyScorm.ScormAPI);
      });
    });

    describe("#LMSCommit", function() {
      beforeEach(function() {
        api.on("LMSCommit", listener);
      });

      context("when not initialized", function() {
        beforeEach(function() {
          result = api.LMSCommit();
        });

        it("should throw a SCORM error", function() {
          expect(api.throwSCORMError).to.have.been.calledOnce;
          expect(api.throwSCORMError).to.have.been.calledWith(301);
          expect(api.LMSGetLastError()).to.equal("301");
        });

        it("should not notify event listeners", function() {
          expect(listener).to.not.have.been.called;
        });

        it("should log at INFO level", function() {
          expect(api.apiLog).to.have.been.calledWith("LMSCommit", null, sinon.match.string, constants.LOG_LEVEL_INFO);
        });

        it("should return false", function() {
          expect(result).to.equal(constants.SCORM_FALSE);
        });
      });

      context("when initialized", function() {
        beforeEach(function() {
          api.LMSInitialize();
          api.apiLog.reset();
          api.lastErrorCode = "301";
          result = api.LMSCommit();
        });

        it("should notify event listeners", function() {
          expect(listener).to.have.been.calledOnce;
        });

        it("should log at INFO level", function() {
          expect(api.apiLog).to.have.been.calledOnce;
          expect(api.apiLog).to.have.been.calledWith("LMSCommit", null, sinon.match.string, constants.LOG_LEVEL_INFO);
        });

        it("should clear the error state", function() {
          expect(api.LMSGetLastError()).to.equal("0");
        });

        it("should return true", function() {
          expect(result).to.equal(constants.SCORM_TRUE);
        });
      });
    });

    describe("#LMSFinish", function() {
      beforeEach(function() {
        api.on("LMSFinish", listener);
      });

      context("when not initialized", function() {
        beforeEach(function() {
          result = api.LMSFinish();
        });

        it("should throw a SCORM error", function() {
          expect(api.throwSCORMError).to.have.been.calledOnce;
          expect(api.throwSCORMError).to.have.been.calledWith(301);
          expect(api.LMSGetLastError()).to.equal("301");
        });

        it("should not terminate the API", function() {
          expect(api.currentState).to.equal(constants.STATE_NOT_INITIALIZED);
        });

        it("should not notify event listeners", function() {
          expect(listener).to.not.have.been.called;
        });

        it("should log at INFO level", function() {
          expect(api.apiLog).to.have.been.calledWith("LMSFinish", null, sinon.match.string, constants.LOG_LEVEL_INFO);
        });

        it("should return false", function() {
          expect(result).to.equal(constants.SCORM_FALSE);
        });
      });

      context("when initialized", function() {
        beforeEach(function() {
          api.LMSInitialize();
          api.apiLog.reset();
          api.lastErrorCode = "301";
          result = api.LMSFinish();
        });

        it("should terminate the API", function() {
          expect(api.currentState).to.equal(constants.STATE_TERMINATED);
        });

        it("should notify event listeners", function() {
          expect(listener).to.have.been.calledOnce;
        });

        it("should log at INFO level", function() {
          expect(api.apiLog).to.have.been.calledOnce;
          expect(api.apiLog).to.have.been.calledWith("LMSFinish", null, sinon.match.string, constants.LOG_LEVEL_INFO);
        });

        it("should clear the error state", function() {
          expect(api.LMSGetLastError()).to.equal("0");
        });

        it("should return true", function() {
          expect(result).to.equal(constants.SCORM_TRUE);
        });
      });
    });

    describe("#LMSInitialize", function() {
      beforeEach(function() {
        api.lastErrorCode = "301";
        api.on("LMSInitialize", listener);
        result = api.LMSInitialize();
      });

      it("should initialize the API", function() {
        expect(api.currentState).to.equal(constants.STATE_INITIALIZED);
      });

      it("should notify event listeners", function() {
        expect(listener).to.have.been.calledOnce;
      });

      it("should log at INFO level", function() {
        expect(api.apiLog).to.have.been.calledOnce;
        expect(api.apiLog).to.have.been.calledWith("LMSInitialize", null, sinon.match.string, constants.LOG_LEVEL_INFO);
      });

      it("should clear the error state", function() {
        expect(api.LMSGetLastError()).to.equal("0");
      });

      it("should return true", function() {
        expect(result).to.equal(constants.SCORM_TRUE);
      });

      context("when already initialized", function() {
        beforeEach(function() {
          api.apiLog.reset();
          listener.reset();
          result = api.LMSInitialize();
        });

        it("should throw a SCORM error", function() {
          expect(api.throwSCORMError).to.have.been.calledOnce;
          expect(api.throwSCORMError).to.have.been.calledWith(101, sinon.match.string);
          expect(api.LMSGetLastError()).to.equal("101");
        });

        it("should not notify event listeners", function() {
          expect(listener).to.not.have.been.called;
        });

        it("should log at INFO level", function() {
          expect(api.apiLog).to.have.been.calledWith("LMSInitialize", null, sinon.match.string, constants.LOG_LEVEL_INFO);
        });

        it("should return false", function() {
          expect(result).to.equal(constants.SCORM_FALSE);
        });
      });

      context("when finished", function() {
        beforeEach(function() {
          result = api.LMSFinish();
          api.apiLog.reset();
          listener.reset();
          result = api.LMSInitialize();
        });

        it("should throw a SCORM error", function() {
          expect(api.throwSCORMError).to.have.been.calledOnce;
          expect(api.throwSCORMError).to.have.been.calledWith(101, sinon.match.string);
          expect(api.LMSGetLastError()).to.equal("101");
        });

        it("should not initialize the API", function() {
          expect(api.currentState).to.equal(constants.STATE_TERMINATED);
        });

        it("should not notify event listeners", function() {
          expect(listener).to.not.have.been.called;
        });

        it("should log at INFO level", function() {
          expect(api.apiLog).to.have.been.calledWith("LMSInitialize", null, sinon.match.string, constants.LOG_LEVEL_INFO);
        });

        it("should return false", function() {
          expect(result).to.equal(constants.SCORM_FALSE);
        });
      });
    });
  });
})();
