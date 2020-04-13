(function() {
  "use strict";

  describe("baseAPI", function() {
    var originalFunctions = {};
    var api, constants;

    beforeEach(function() {
      api = new window.simplifyScorm.BaseAPI();
      constants = window.simplifyScorm.constants;

      originalFunctions["console.error"] = console.error;
      originalFunctions["console.info"] = console.info;
      originalFunctions["console.warn"] = console.warn;
      console.error = sinon.stub();
      console.info = sinon.stub();
      console.warn = sinon.stub();
    });

    afterEach(function() {
      console.error = originalFunctions["console.error"];
      console.info = originalFunctions["console.info"];
      console.warn = originalFunctions["console.warn"];
    });

    context("initially", it_behaves_like_a_freshly_initialized_api);

    describe("#apiLog", function() {
      var anyCMIElement = "any CMI element";
      var anyFunctionName = "any function name";
      var anyLogMessage = "any log message";

      describe("should compose a message", function() {
        var logMessage;

        beforeEach(function() {
          api.apiLogLevel = constants.LOG_LEVEL_DEBUG;
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);
          logMessage = console.error.getCall(0).args[0];
        });

        it("that includes the function name", function() {
          expect(logMessage).to.include(anyFunctionName);
        });

        it("that includes the CMI element", function() {
          expect(logMessage).to.include(anyCMIElement);
        });

        it("that includes the log message", function() {
          expect(logMessage).to.include(anyLogMessage);
        });
      });

      context("when message level is ERROR", function() {
        it("should log the message to the error console", function() {
          api.apiLogLevel = constants.LOG_LEVEL_DEBUG;

          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);

          expect(console.error).to.have.been.calledOnce;
          expect(console.warn).to.not.have.been.called;
          expect(console.info).to.not.have.been.called;
        });
      });

      context("when message level is WARNING", function() {
        it("should log the message to the warning console", function() {
          api.apiLogLevel = constants.LOG_LEVEL_DEBUG;

          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_WARNING);

          expect(console.error).to.not.have.been.called;
          expect(console.warn).to.have.been.calledOnce;
          expect(console.info).to.not.have.been.called;
        });
      });

      context("when message level is INFO", function() {
        it("should log the message to the info console", function() {
          api.apiLogLevel = constants.LOG_LEVEL_DEBUG;

          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_INFO);

          expect(console.error).to.not.have.been.called;
          expect(console.warn).to.not.have.been.called;
          expect(console.info).to.have.been.calledOnce;
        });
      });

      context("when log level is DEBUG", function() {
        beforeEach(function() {
          api.apiLogLevel = constants.LOG_LEVEL_DEBUG;
        });

        it("should log ERROR messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);
          expect(console.error).to.have.been.calledOnce;
        });

        it("should log WARNING messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_WARNING);
          expect(console.warn).to.have.been.calledOnce;
        });

        it("should log INFO messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_INFO);
          expect(console.info).to.have.been.calledOnce;
        });
      });

      context("when log level is INFO", function() {
        beforeEach(function() {
          api.apiLogLevel = constants.LOG_LEVEL_INFO;
        });

        it("should log ERROR messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);
          expect(console.error).to.have.been.calledOnce;
        });

        it("should log WARNING messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_WARNING);
          expect(console.warn).to.have.been.calledOnce;
        });

        it("should log INFO messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_INFO);
          expect(console.info).to.have.been.calledOnce;
        });
      });

      context("when log level is WARNING", function() {
        beforeEach(function() {
          api.apiLogLevel = constants.LOG_LEVEL_WARNING;
        });

        it("should log ERROR messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);
          expect(console.error).to.have.been.calledOnce;
        });

        it("should log WARNING messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_WARNING);
          expect(console.warn).to.have.been.calledOnce;
        });

        it("should not log INFO messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_INFO);
          expect(console.info).to.not.have.been.called;
        });
      });

      context("when log level is ERROR", function() {
        beforeEach(function() {
          api.apiLogLevel = constants.LOG_LEVEL_ERROR;
        });

        it("should log ERROR messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);
          expect(console.error).to.have.been.calledOnce;
        });

        it("should not log WARNING messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_WARNING);
          expect(console.warn).to.not.have.been.called;
        });

        it("should not log INFO messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_INFO);
          expect(console.info).to.not.have.been.called;
        });
      });

      context("when log level is NONE", function() {
        beforeEach(function() {
          api.apiLogLevel = constants.LOG_LEVEL_NONE;
        });

        it("should not log ERROR messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_ERROR);
          expect(console.error).to.not.have.been.called;
        });

        it("should not log WARNING messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_WARNING);
          expect(console.warn).to.not.have.been.called;
        });

        it("should not log INFO messages", function() {
          api.apiLog(anyFunctionName, anyCMIElement, anyLogMessage, constants.LOG_LEVEL_INFO);
          expect(console.info).to.not.have.been.called;
        });
      });
    });

    describe("#clearSCORMError", function() {
      var anyLastErrorCode = 101;

      beforeEach(function() {
        api.lastErrorCode = anyLastErrorCode;
      });

      context("given a success", function() {
        it("should clear the last SCORM error", function() {
          api.clearSCORMError(constants.SCORM_TRUE);
          expect(api.lastErrorCode).to.equal("0");
        });
      });

      context("given a failure", function() {
        it("should not clear the last SCORM error", function() {
          api.clearSCORMError(constants.SCORM_FALSE);
          expect(api.lastErrorCode).to.equal(anyLastErrorCode);
        });
      });
    });

    describe("#getLmsErrorMessageDetails", function() {
      it("should return no error", function() {
        expect(api.getLmsErrorMessageDetails()).to.equal("No error");
      });
    });

    describe("#isInitialized", function() {
      context("when state is NOT_INITIALIZED", function() {
        it("should return false", function() {
          api.currentState = constants.STATE_NOT_INITIALIZED;
          expect(api.isInitialized()).to.be.false;
        });
      });

      context("when state is INITIALIZED", function() {
        it("should return true", function() {
          api.currentState = constants.STATE_INITIALIZED;
          expect(api.isInitialized()).to.be.true;
        });
      });

      context("when state is TERMINATED", function() {
        it("should return false", function() {
          api.currentState = constants.STATE_TERMINATED;
          expect(api.isInitialized()).to.be.false;
        });
      });
    });

    describe("#isNotInitialized", function() {
      context("when state is NOT_INITIALIZED", function() {
        it("should return true", function() {
          api.currentState = constants.STATE_NOT_INITIALIZED;
          expect(api.isNotInitialized()).to.be.true;
        });
      });

      context("when state is INITIALIZED", function() {
        it("should return false", function() {
          api.currentState = constants.STATE_INITIALIZED;
          expect(api.isNotInitialized()).to.be.false;
        });
      });

      context("when state is TERMINATED", function() {
        it("should return false", function() {
          api.currentState = constants.STATE_TERMINATED;
          expect(api.isNotInitialized()).to.be.false;
        });
      });
    });

    describe("#isTerminated", function() {
      context("when state is NOT_INITIALIZED", function() {
        it("should return false", function() {
          api.currentState = constants.STATE_NOT_INITIALIZED;
          expect(api.isTerminated()).to.be.false;
        });
      });

      context("when state is INITIALIZED", function() {
        it("should return false", function() {
          api.currentState = constants.STATE_INITIALIZED;
          expect(api.isTerminated()).to.be.false;
        });
      });

      context("when state is TERMINATED", function() {
        it("should return true", function() {
          api.currentState = constants.STATE_TERMINATED;
          expect(api.isTerminated()).to.be.true;
        });
      });
    });

    describe("#processListeners", function() {
      var anyFunctionName = "anyFunctionName";
      var anyOtherFunctionName = "anyOtherFunctionName";
      var anyCMIElement = "any CMI element";
      var anyOtherCMIElement = "any other CMI element";
      var anyValue = "any value";
      var callbacks;

      beforeEach(function() {
        callbacks = [sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub(), sinon.stub()];

        api.on(anyFunctionName, callbacks[0]);
        api.on(anyFunctionName + "." + anyCMIElement, callbacks[1]);
        api.on(anyFunctionName + "." + anyOtherCMIElement, callbacks[2]);
        api.on(anyFunctionName + " " + anyOtherFunctionName, callbacks[3]);
        api.on(anyOtherFunctionName, callbacks[4]);
        api.on(anyOtherFunctionName + "." + anyCMIElement, callbacks[5]);
        api.on(anyOtherFunctionName + "." + anyOtherCMIElement, callbacks[6]);

        api.processListeners(anyFunctionName, anyCMIElement, anyValue);
      });

      context("when function name matches", function() {
        context("and listener has not specified a CMI element", function() {
          it("should call the listener", function() {
            expect(callbacks[0]).to.have.been.calledOnce;
            expect(callbacks[0]).to.have.been.calledWith(anyCMIElement, anyValue);
          });
        });

        context("and listener's CMI element matches", function() {
          it("should call the listener", function() {
            expect(callbacks[1]).to.have.been.calledOnce;
            expect(callbacks[1]).to.have.been.calledWith(anyCMIElement, anyValue);
          });
        });

        context("and listener's CMI element doesn't match", function() {
          it("should not call the listener", function() {
            expect(callbacks[2]).to.not.have.been.called;
          });
        });
      });

      context("when function name matches multiple functions", function() {
        context("and listener has not specified a CMI element", function() {
          it("should call the listener", function() {
            expect(callbacks[3]).to.have.been.calledOnce;
            expect(callbacks[3]).to.have.been.calledWith(anyCMIElement, anyValue);
          });
        });
      });

      context("when function name doesn't match", function() {
        it("should not call the listener", function() {
          expect(callbacks[4]).to.not.have.been.called;
          expect(callbacks[5]).to.not.have.been.called;
          expect(callbacks[6]).to.not.have.been.called;
        });
      });
    });

    describe(".reset", function() {
      beforeEach(function() {
        api.currentState = constants.STATE_INITIALIZED;
        api.lastErrorCode = Math.floor(Math.random() * 1000) + 1;
        api.apiLogLevel = constants.LOG_LEVEL_NONE;
        api.on("anyFunctionName", sinon.stub());

        window.simplifyScorm.BaseAPI.reset.call(api);
      });

      it_behaves_like_a_freshly_initialized_api();
    });

    describe("#throwSCORMError", function() {
      var anyErrorNumber = Math.floor(Math.random() * 1000) + 1;
      var anyErrorMessage = "any error message";

      beforeEach(function() {
        sinon.spy(api, "apiLog");
        originalFunctions["api.getLmsErrorMessageDetails"] = api.getLmsErrorMessageDetails;
        api.getLmsErrorMessageDetails = sinon.stub().returns(anyErrorMessage);
      });

      afterEach(function() {
        api.apiLog.restore();
        api.getLmsErrorMessageDetails = originalFunctions["api.getLmsErrorMessageDetails"];
      });

      it("should remember the error code as a string", function() {
        api.throwSCORMError(anyErrorNumber);
        expect(api.lastErrorCode).to.equal(String(anyErrorNumber));
      });

      context("when a message is specified", function() {
        it("should log the error message", function() {
          api.throwSCORMError(anyErrorNumber, anyErrorMessage);

          expect(api.getLmsErrorMessageDetails).to.not.have.been.called;
          expect(api.apiLog).to.have.been.calledOnce;
          expect(api.apiLog).to.have.been.calledWith("throwSCORMError", null, anyErrorNumber + ": " + anyErrorMessage, constants.LOG_LEVEL_ERROR);
        });
      });

      context("when no message is specified", function() {
        it("should get message details using the error number", function() {
          api.throwSCORMError(anyErrorNumber);

          expect(api.getLmsErrorMessageDetails).to.have.been.calledOnce;
          expect(api.getLmsErrorMessageDetails).to.have.been.calledWith(anyErrorNumber);
          expect(api.apiLog).to.have.been.calledOnce;
          expect(api.apiLog).to.have.been.calledWith("throwSCORMError", null, anyErrorNumber + ": " + anyErrorMessage, constants.LOG_LEVEL_ERROR);
        });
      });
    });

    ////////////////

    function it_behaves_like_a_freshly_initialized_api() {
      it("should be in NOT_INITIALIZED state", function() {
        expect(api.currentState).to.equal(constants.STATE_NOT_INITIALIZED);
      });

      it("should not have a last error code", function() {
        expect(api.lastErrorCode).to.equal("0");
      });

      it("should set log level to ERROR", function() {
        expect(api.apiLogLevel).to.equal(constants.LOG_LEVEL_ERROR);
      });

      it("should have an empty listener array", function() {
        expect(api.listenerArray).to.deep.equal([]);
      });
    }
  });
})();
