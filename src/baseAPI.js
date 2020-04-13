(function() {
  window.simplifyScorm.BaseAPI = BaseAPI;

  var constants = window.simplifyScorm.constants;

  function BaseAPI() {
    var _self = this;

    // Internal State
    _self.currentState = constants.STATE_NOT_INITIALIZED;
    _self.lastErrorCode = "0";

    // Utility Functions
    _self.apiLog = apiLog;
    _self.apiLogLevel = constants.LOG_LEVEL_ERROR;
    _self.clearSCORMError = clearSCORMError;
    _self.getLmsErrorMessageDetails = getLmsErrorMessageDetails;
    _self.isInitialized = isInitialized;
    _self.isNotInitialized = isNotInitialized;
    _self.isTerminated = isTerminated;
    _self.listenerArray = [];
    _self.on = onListener;
    _self.processListeners = processListeners;
    _self.throwSCORMError = throwSCORMError;
  }
  BaseAPI.reset = reset;

  /**
   * Logging for all SCORM actions
   *
   * @param functionName
   * @param CMIElement
   * @param logMessage
   * @param messageLevel
   */
  function apiLog(functionName, CMIElement, logMessage, messageLevel) {
    logMessage = formatMessage(functionName, CMIElement, logMessage);

    if (messageLevel >= this.apiLogLevel) {
      switch (messageLevel) {
        case constants.LOG_LEVEL_ERROR:
          console.error(logMessage);
          break;
        case constants.LOG_LEVEL_WARNING:
          console.warn(logMessage);
          break;
        case constants.LOG_LEVEL_INFO:
          console.info(logMessage);
          break;
      }
    }
  }

  /**
   * Clears the last SCORM error code on success
   */
  function clearSCORMError(success) {
    if (success !== constants.SCORM_FALSE) {
      this.lastErrorCode = "0";
    }
  }

  /**
   * Formats the SCORM messages for easy reading
   *
   * @param functionName
   * @param CMIElement
   * @param message
   * @returns {string}
   */
  function formatMessage(functionName, CMIElement, message) {
    var baseLength = 20;
    var messageString = "";

    messageString += functionName;

    var fillChars = baseLength - messageString.length;

    for (var i = 0; i < fillChars; i++) {
      messageString += " ";
    }

    messageString += ": ";

    if (CMIElement) {
      var CMIElementBaseLength = 70;

      messageString += CMIElement;

      fillChars = CMIElementBaseLength - messageString.length;

      for (var j = 0; j < fillChars; j++) {
        messageString += " ";
      }
    }

    if (message) {
      messageString += message;
    }

    return messageString;
  }

  /**
   * Returns the message that corresponds to errrorNumber
   * APIs that inherit BaseAPI should override this function
   */
  function getLmsErrorMessageDetails(_errorNumber, _detail) {
    return "No error";
  }

  /**
   * Returns true if the API's current state is STATE_INITIALIZED
   */
  function isInitialized() {
    return this.currentState === constants.STATE_INITIALIZED;
  }

  /**
   * Returns true if the API's current state is STATE_NOT_INITIALIZED
   */
  function isNotInitialized() {
    return this.currentState === constants.STATE_NOT_INITIALIZED;
  }

  /**
   * Returns true if the API's current state is STATE_TERMINATED
   */
  function isTerminated() {
    return this.currentState === constants.STATE_TERMINATED;
  }

  /**
   * Provides a mechanism for attaching to a specific SCORM event
   *
   * @param listenerString
   * @param callback
   */
  function onListener(listenerString, callback) {
    if (!callback) return;

    var listenerFunctions = listenerString.split(" ");
    for (var i = 0; i < listenerFunctions.length; i++) {
      var listenerSplit = listenerFunctions[i].split(".");
      if (listenerSplit.length === 0) return;

      var functionName = listenerSplit[0];

      var CMIElement = null;
      if (listenerSplit.length > 1) {
        CMIElement = listenerString.replace(functionName + ".", "");
      }

      this.listenerArray.push({
        functionName: functionName,
        CMIElement: CMIElement,
        callback: callback
      });
    }
  }

  /**
   * Processes any 'on' listeners that have been created
   *
   * @param functionName
   * @param CMIElement
   * @param value
   */
  function processListeners(functionName, CMIElement, value) {
    for (var i = 0; i < this.listenerArray.length; i++) {
      var listener = this.listenerArray[i];
      var functionsMatch = listener.functionName === functionName;
      var listenerHasCMIElement = !!listener.CMIElement;
      var CMIElementsMatch = listener.CMIElement === CMIElement;

      if (functionsMatch && (!listenerHasCMIElement || CMIElementsMatch)) {
        listener.callback(CMIElement, value);
      }
    }
  }

  /**
   * Reset the API to its initial state
   */
  function reset() {
    // Internal State
    this.currentState = constants.STATE_NOT_INITIALIZED;
    this.lastErrorCode = "0";

    // Utility Functions
    this.apiLogLevel = constants.LOG_LEVEL_ERROR;
    this.listenerArray = [];
  }

  /**
   * Throws a SCORM error
   *
   * @param errorNumber
   * @param message
   */
  function throwSCORMError(errorNumber, message) {
    if (!message) {
      message = this.getLmsErrorMessageDetails(errorNumber);
    }

    this.apiLog("throwSCORMError", null, errorNumber + ": " + message, constants.LOG_LEVEL_ERROR);

    this.lastErrorCode = String(errorNumber);
  }
})();
