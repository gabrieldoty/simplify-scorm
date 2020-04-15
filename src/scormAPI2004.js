(function() {
  /**
   * Based on the Scorm 2004 definitions from https://scorm.com
   *
   * Scorm 2004 Overview for Developers: https://scorm.com/scorm-explained/technical-scorm/scorm-2004-overview-for-developers/
   * Run-Time Reference: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
   * Scorm specification: https://adlnet.gov/research/scorm/scorm-2004-4th-edition/
   * Testing requirements: https://adlnet.gov/assets/uploads/SCORM_2004_4ED_v1_1_TR_20090814.pdf
   *
   * SPM = Smallest Permitted Maximum
   */
  window.simplifyScorm.ScormAPI2004 = ScormAPI2004;

  var BaseAPI = window.simplifyScorm.BaseAPI;
  var constants = window.simplifyScorm.constants;
  var jsonFormatter = window.simplifyScorm.jsonFormatter;

  window.API_1484_11 = new ScormAPI2004();

  function ScormAPI2004() {
    var _self = this;

    BaseAPI.call(_self);

    // API Signature
    _self.version = "1.0";
    _self.Initialize = LMSInitialize;
    _self.Terminate = LMSTerminate;
    _self.GetValue = LMSGetValue;
    _self.SetValue = LMSSetValue;
    _self.Commit = LMSCommit;
    _self.GetLastError = LMSGetLastError;
    _self.GetErrorString = LMSGetErrorString;
    _self.GetDiagnostic = LMSGetDiagnostic;

    // Data Model
    _self.cmi = new CMI(_self);
    _self.adl = new ADL(_self);

    // Utility Functions
    _self.getLmsErrorMessageDetails = getLmsErrorMessageDetails;
    _self.loadFromJSON = loadFromJSON;
    _self.reset = reset;

    /**
     * @param Empty String
     * @returns {string} bool
     */
    function LMSInitialize() {
      var returnValue = constants.SCORM_FALSE;

      if (_self.isInitialized()) {
        _self.throwSCORMError(103);
      } else if (_self.isTerminated()) {
        _self.throwSCORMError(104);
      } else {
        _self.currentState = constants.STATE_INITIALIZED;
        _self.lastErrorCode = 0;
        returnValue = constants.SCORM_TRUE;
        _self.processListeners("Initialize");
      }

      _self.apiLog("Initialize", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * @param Empty String
     * @returns {string} bool
     */
    function LMSTerminate() {
      var returnValue = constants.SCORM_FALSE;

      if (_self.isNotInitialized()) {
        _self.throwSCORMError(112);
      } else if (_self.isTerminated()) {
        _self.throwSCORMError(113);
      } else {
        _self.currentState = constants.STATE_TERMINATED;
        _self.lastErrorCode = 0;
        returnValue = constants.SCORM_TRUE;
        _self.processListeners("Terminate");
      }

      _self.apiLog("Terminate", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * @param CMIElement
     * @returns {string}
     */
    function LMSGetValue(CMIElement) {
      var returnValue = "";

      if (_self.isNotInitialized()) {
        _self.throwSCORMError(122);
      } else if (_self.isTerminated()) {
        _self.throwSCORMError(123);
      } else {
        _self.lastErrorCode = 0;
        returnValue = getCMIValue(CMIElement);
        _self.processListeners("GetValue", CMIElement);
      }

      _self.apiLog("GetValue", CMIElement, ": returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * @param CMIElement
     * @param value
     * @returns {string}
     */
    function LMSSetValue(CMIElement, value) {
      var returnValue = "";

      if (_self.isNotInitialized()) {
        _self.throwSCORMError(132);
      } else if (_self.isTerminated()) {
        _self.throwSCORMError(133);
      } else {
        _self.lastErrorCode = 0;
        returnValue = setCMIValue(CMIElement, value);
        _self.processListeners("SetValue", CMIElement, value);
      }

      _self.apiLog("SetValue", CMIElement, ": " + value + ": result: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * Orders LMS to store all content parameters
     *
     * @returns {string} bool
     */
    function LMSCommit() {
      var returnValue = constants.SCORM_FALSE;

      if (_self.isNotInitialized()) {
        _self.throwSCORMError(142);
      } else if (_self.isTerminated()) {
        _self.throwSCORMError(143);
      } else {
        _self.lastErrorCode = 0;
        returnValue = constants.SCORM_TRUE;
        _self.processListeners("Commit");
      }

      _self.apiLog("Commit", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * Returns last error code
     *
     * @returns {string}
     */
    function LMSGetLastError() {
      var returnValue = String(_self.lastErrorCode);

      _self.processListeners("GetLastError");

      _self.apiLog("GetLastError", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);

      return returnValue;
    }

    /**
     * Returns the errorNumber error description
     *
     * @param CMIErrorCode
     * @returns {string}
     */
    function LMSGetErrorString(CMIErrorCode) {
      var returnValue = "";

      if (CMIErrorCode !== null && CMIErrorCode !== "") {
        returnValue = _self.getLmsErrorMessageDetails(CMIErrorCode);
        _self.processListeners("GetErrorString");
      }

      _self.apiLog("GetErrorString", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);

      return returnValue;
    }

    /**
     * Returns a comprehensive description of the errorNumber error.
     *
     * @param CMIErrorCode
     * @returns {string}
     */
    function LMSGetDiagnostic(CMIErrorCode) {
      var returnValue = "";

      if (CMIErrorCode !== null && CMIErrorCode !== "") {
        returnValue = _self.getLmsErrorMessageDetails(CMIErrorCode, true);
        _self.processListeners("GetDiagnostic");
      }

      _self.apiLog("GetDiagnostic", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);

      return returnValue;
    }

    /**
     * Sets a value on the CMI Object
     *
     * @param CMIElement
     * @param value
     * @returns {string}
     */
    function setCMIValue(CMIElement, value) {
      if (!CMIElement || CMIElement === "") {
        return constants.SCORM_FALSE;
      }

      var structure = CMIElement.split(".");
      var refObject = _self;
      var returnValue = constants.SCORM_FALSE;

      for (var i = 0; i < structure.length; i++) {
        var attribute = structure[i];

        if (i === structure.length - 1) {
          if ((attribute.substr(0, 8) == "{target=") && (typeof refObject._isTargetValid == "function")) {
            _self.throwSCORMError(404);
          } else if (!refObject.hasOwnProperty(attribute)) {
            _self.throwSCORMError(401, "The data model element passed to SetValue (" + CMIElement + ") is not a valid SCORM data model element.");
          } else {
            refObject[attribute] = value;
            if (_self.lastErrorCode == 0) {
              returnValue = constants.SCORM_TRUE;
            }
          }
        } else {
          refObject = refObject[attribute];
          if (!refObject) {
            _self.throwSCORMError(401, "The data model element passed to SetValue (" + CMIElement + ") is not a valid SCORM data model element.");
            break;
          }

          if (refObject.hasOwnProperty("childArray")) {
            var index = parseInt(structure[i + 1], 10);

            // SCO is trying to set an item on an array
            if (!isNaN(index)) {
              var item = refObject.childArray[index];

              if (item) {
                refObject = item;
              } else {
                var newChild;

                if (CMIElement.indexOf("cmi.comments_from_learner") > -1) {
                  newChild = new CommentsFromLearnerObject(_self);
                } else if (CMIElement.indexOf("cmi.comments_from_lms") > -1) {
                  newChild = new CommentsFromLMSObject(_self);
                } else if (CMIElement.indexOf("cmi.objectives") > -1) {
                  newChild = new ObjectivesObject(_self);
                } else if (CMIElement.indexOf(".correct_responses") > -1) {
                  newChild = new InteractionsCorrectResponsesObject(_self);
                } else if (CMIElement.indexOf(".objectives") > -1) {
                  newChild = new InteractionsObjectivesObject(_self);
                } else if (CMIElement.indexOf("cmi.interactions") > -1) {
                  newChild = new InteractionsObject(_self);
                }

                if (!newChild) {
                  _self.throwSCORMError(401, "The data model element passed to SetValue (" + CMIElement + ") is not a valid SCORM data model element.");
                } else {
                  refObject.childArray.push(newChild);

                  refObject = newChild;
                }
              }

              // Have to update i value to skip the array position
              i++;
            }
          }
        }
      }

      if (returnValue === constants.SCORM_FALSE) {
        _self.apiLog("SetValue", null, "There was an error setting the value for: " + CMIElement + ", value of: " + value, constants.LOG_LEVEL_WARNING);
      }

      return returnValue;
    }

    /**
     * Gets a value from the CMI Object
     *
     * @param CMIElement
     * @returns {*}
     */
    function getCMIValue(CMIElement) {
      if (!CMIElement || CMIElement === "") {
        return "";
      }

      var structure = CMIElement.split(".");
      var refObject = _self;

      for (var i = 0; i < structure.length; i++) {
        var attribute = structure[i];

        if ((attribute.substr(0, 8) == "{target=") && (typeof refObject._isTargetValid == "function")) {
          var target = attribute.substr(8, attribute.length - 9);
          return refObject._isTargetValid(target);
        } else if (!refObject.hasOwnProperty(attribute)) {
          _self.throwSCORMError(401, "The data model element passed to GetValue (" + CMIElement + ") is not a valid SCORM data model element.");
          return "";
        }

        refObject = refObject[attribute];
      }

      return refObject || "";
    }

    /**
     * Returns the message that corresponds to errrorNumber.
     */
    function getLmsErrorMessageDetails(errorNumber, detail) {
      var basicMessage = "";
      var detailMessage = "";

      // Set error number to string since inconsistent from modules if string or number
      errorNumber = String(errorNumber);

      switch (errorNumber) {
        case "0":
          basicMessage = "No Error";
          detailMessage = "No error occurred, the previous API call was successful.";
          break;

        case "101":
          basicMessage = "General Exception";
          detailMessage = "No specific error code exists to describe the error. Use GetDiagnostic for more information.";
          break;

        case "102":
          basicMessage = "General Initialization Failure";
          detailMessage = "Call to Initialize failed for an unknown reason.";
          break;

        case "103":
          basicMessage = "Already Initialized";
          detailMessage = "Call to Initialize failed because Initialize was already called.";
          break;

        case "104":
          basicMessage = "Content Instance Terminated";
          detailMessage = "Call to Initialize failed because Terminate was already called.";
          break;

        case "111":
          basicMessage = "General Termination Failure";
          detailMessage = "Call to Terminate failed for an unknown reason.";
          break;

        case "112":
          basicMessage = "Termination Before Initialization";
          detailMessage = "Call to Terminate failed because it was made before the call to Initialize.";
          break;

        case "113":
          basicMessage = "Termination After Termination";
          detailMessage = "Call to Terminate failed because Terminate was already called.";
          break;

        case "122":
          basicMessage = "Retrieve Data Before Initialization";
          detailMessage = "Call to GetValue failed because it was made before the call to Initialize.";
          break;

        case "123":
          basicMessage = "Retrieve Data After Termination";
          detailMessage = "Call to GetValue failed because it was made after the call to Terminate.";
          break;

        case "132":
          basicMessage = "Store Data Before Initialization";
          detailMessage = "Call to SetValue failed because it was made before the call to Initialize.";
          break;

        case "133":
          basicMessage = "Store Data After Termination";
          detailMessage = "Call to SetValue failed because it was made after the call to Terminate.";
          break;

        case "142":
          basicMessage = "Commit Before Initialization";
          detailMessage = "Call to Commit failed because it was made before the call to Initialize.";
          break;

        case "143":
          basicMessage = "Commit After Termination";
          detailMessage = "Call to Commit failed because it was made after the call to Terminate.";
          break;

        case "201":
          basicMessage = "General Argument Error";
          detailMessage = "An invalid argument was passed to an API method (usually indicates that Initialize, Commit or Terminate did not receive the expected empty string argument.";
          break;

        case "301":
          basicMessage = "General Get Failure";
          detailMessage = "Indicates a failed GetValue call where no other specific error code is applicable. Use GetDiagnostic for more information.";
          break;

        case "351":
          basicMessage = "General Set Failure";
          detailMessage = "Indicates a failed SetValue call where no other specific error code is applicable. Use GetDiagnostic for more information.";
          break;

        case "391":
          basicMessage = "General Commit Failure";
          detailMessage = "Indicates a failed Commit call where no other specific error code is applicable. Use GetDiagnostic for more information.";
          break;

        case "401":
          basicMessage = "Undefined Data Model Element";
          detailMessage = "The data model element name passed to GetValue or SetValue is not a valid SCORM data model element.";
          break;

        case "402":
          basicMessage = "Unimplemented Data Model Element";
          detailMessage = "The data model element indicated in a call to GetValue or SetValue is valid, but was not implemented by this LMS. In SCORM 2004, this error would indicate an LMS that is not fully SCORM conformant.";
          break;

        case "403":
          basicMessage = "Data Model Element Value Not Initialized";
          detailMessage = "Attempt to read a data model element that has not been initialized by the LMS or through a SetValue call. This error condition is often reached during normal execution of a SCO.";
          break;

        case "404":
          basicMessage = "Data Model Element Is Read Only";
          detailMessage = "SetValue was called with a data model element that can only be read.";
          break;

        case "405":
          basicMessage = "Data Model Element Is Write Only";
          detailMessage = "GetValue was called on a data model element that can only be written to.";
          break;

        case "406":
          basicMessage = "Data Model Element Type Mismatch";
          detailMessage = "SetValue was called with a value that is not consistent with the data format of the supplied data model element.";
          break;

        case "407":
          basicMessage = "Data Model Element Value Out Of Range";
          detailMessage = "The numeric value supplied to a SetValue call is outside of the numeric range allowed for the supplied data model element.";
          break;

        case "408":
          basicMessage = "Data Model Dependency Not Established";
          detailMessage = "Some data model elements cannot be set until another data model element was set. This error condition indicates that the prerequisite element was not set before the dependent element.";
          break;

        default:
          basicMessage = "";
          detailMessage = "";
          break;
      }

      return detail ? detailMessage : basicMessage;
    }

    /**
     * Loads CMI data from a JSON object.
     */
    function loadFromJSON(json, CMIElement) {
      if (!_self.isNotInitialized()) {
        console.error("loadFromJSON can only be called before the call to Initialize.");
        return;
      }

      CMIElement = CMIElement || "cmi";

      for (var key in json) {
        if (json.hasOwnProperty(key) && json[key]) {
          var currentCMIElement = CMIElement + "." + key;
          var value = json[key];

          if (value["childArray"]) {
            for (var i = 0; i < value["childArray"].length; i++) {
              _self.loadFromJSON(value["childArray"][i], currentCMIElement + "." + i);
            }
          } else if (value.constructor === Object) {
            _self.loadFromJSON(value, currentCMIElement);
          } else {
            setCMIValue(currentCMIElement, value);
          }
        }
      }
    }

    /**
     * Reset the API to its initial state
     */
    function reset() {
      BaseAPI.reset.call(_self);

      // Data Model
      _self.cmi = new CMI(_self);
      _self.adl = new ADL(_self);
    }

    return _self;
  }

  /**
   * Cmi data model
   */
  function CMI(API) {
    return {
      __version: "1.0",
      get _version() { return this.__version; },
      set _version(_version) { API.throwSCORMError(404); },

      _completion_status: "unknown", // Allowed values: "completed", "incomplete", "not attempted", "unknown"
      get completion_status() { return getCompletionStatus(this); },
      set completion_status(completion_status) { this._completion_status = completion_status; },

      _completion_threshold: "", // Data type: real (10,7). Range: 0.0 to 1.0
      get completion_threshold() { return this._completion_threshold; },
      set completion_threshold(completion_threshold) { API.isNotInitialized() ? this._completion_threshold = completion_threshold : API.throwSCORMError(404); },

      _credit: "credit", // Allowed values: "credit", "no-credit"
      get credit() { return this._credit; },
      set credit(credit) { API.isNotInitialized() ? this._credit = credit : API.throwSCORMError(404); },

      _entry: "", // Allowed values: "ab-initio", "resume", ""
      get entry() { return this._entry; },
      set entry(entry) { API.isNotInitialized() ? this._entry = entry : API.throwSCORMError(404); },

      _exit: "", // Allowed values: "time-out", "suspend", "logout", "normal", ""
      get exit() { return (!this.jsonString) ? API.throwSCORMError(405) : this._exit; },
      set exit(exit) { this._exit = exit; },

      _launch_data: "", // SPM 4000 characters
      get launch_data() { return this._launch_data; },
      set launch_data(launch_data) { API.isNotInitialized() ? this._launch_data = launch_data : API.throwSCORMError(404); },

      _learner_id: "", // SPM 4000 characters
      get learner_id() { return this._learner_id; },
      set learner_id(learner_id) { API.isNotInitialized() ? this._learner_id = learner_id : API.throwSCORMError(404); },

      _learner_name: "", // SPM 250 characters
      get learner_name() { return this._learner_name; },
      set learner_name(learner_name) { API.isNotInitialized() ? this._learner_name = learner_name : API.throwSCORMError(404); },

      _location: "", // SPM 1000 characters
      get location() { return this._location; },
      set location(location) { this._location = location; },

      _max_time_allowed: "", // Data type: timeinterval (second,10,2)
      get max_time_allowed() { return this._max_time_allowed; },
      set max_time_allowed(max_time_allowed) { API.isNotInitialized() ? this._max_time_allowed = max_time_allowed : API.throwSCORMError(404); },

      _mode: "normal", // Allowed values: "browse", "normal", "review"
      get mode() { return this._mode; },
      set mode(mode) { API.isNotInitialized() ? this._mode = mode : API.throwSCORMError(404); },

      _progress_measure: "", // Data type: real (10,7). Range: 0.0 to 1.0
      get progress_measure() { return this._progress_measure; },
      set progress_measure(progress_measure) { this._progress_measure = progress_measure; },

      _scaled_passing_score: "", // Data type: real (10,7). Range: -1.0 to 1.0
      get scaled_passing_score() { return this._scaled_passing_score; },
      set scaled_passing_score(scaled_passing_score) { API.isNotInitialized() ? this._scaled_passing_score = scaled_passing_score : API.throwSCORMError(404); },

      _session_time: "", // Data type: timeinterval (second,10,2)
      get session_time() { return (!this.jsonString) ? API.throwSCORMError(405) : this._session_time; },
      set session_time(session_time) { this._session_time = session_time; },

      _success_status: "unknown", // Allowed values: "passed", "failed", "unknown"
      get success_status() { return getSuccessStatus(this); },
      set success_status(success_status) { this._success_status = success_status; },

      _suspend_data: "", // SPM 64000 characters
      get suspend_data() { return this._suspend_data; },
      set suspend_data(suspend_data) { this._suspend_data = suspend_data; },

      _time_limit_action: "continue,no message", // Allowed values: "exit,message", "continue,message", "exit,no message", "continue,no message"
      get time_limit_action() { return this._time_limit_action; },
      set time_limit_action(time_limit_action) { API.isNotInitialized() ? this._time_limit_action = time_limit_action : API.throwSCORMError(404); },

      _total_time: "0", // Data type: timeinterval (second,10,2)
      get total_time() { return this._total_time; },
      set total_time(total_time) { API.isNotInitialized() ? this._total_time = total_time : API.throwSCORMError(404); },

      comments_from_learner: {
        // SPM 250 comments from learner
        __children: "comment,location,timestamp",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        childArray: [],
        get _count() { return String(this.childArray.length); },
        set _count(_count) { API.throwSCORMError(404); },

        toJSON: jsonFormatter
      },

      comments_from_lms: {
        // SPM 100 comments from the LMS
        __children: "comment,location,timestamp",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        childArray: [],
        get _count() { return String(this.childArray.length); },
        set _count(_count) { API.throwSCORMError(404); },

        toJSON: jsonFormatter
      },

      interactions: {
        // SPM 250 interactions
        __children: "id,type,objectives,timestamp,correct_responses,weighting,learner_response,result,latency,description",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        childArray: [],
        get _count() { return String(this.childArray.length); },
        set _count(_count) { API.throwSCORMError(404); },

        toJSON: jsonFormatter
      },

      learner_preference: {
        __children: "audio_level,language,delivery_speed,audio_captioning",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        _audio_level: "1", // Data type: real (10,7). Range: 0.0 to infinity
        get audio_level() { return this._audio_level; },
        set audio_level(audio_level) { this._audio_level = audio_level; },

        _language: "", // SPM 250 characters
        get language() { return this._language; },
        set language(language) { this._language = language; },

        _delivery_speed: "1", // Data type: real (10,7). Range: 0.0 to infinity
        get delivery_speed() { return this._delivery_speed; },
        set delivery_speed(delivery_speed) { this._delivery_speed = delivery_speed; },

        _audio_captioning: "0", // Allowed values: "-1", "0", "1"
        get audio_captioning() { return this._audio_captioning; },
        set audio_captioning(audio_captioning) { this._audio_captioning = audio_captioning; },

        toJSON: jsonFormatter
      },

      objectives: {
        // SPM 100 objectives
        __children: "id,score,success_status,completion_status,progress_measure,description",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        childArray: [],
        get _count() { return String(this.childArray.length); },
        set _count(_count) { API.throwSCORMError(404); },

        toJSON: jsonFormatter
      },

      score: {
        __children: "scaled,raw,min,max",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        _scaled: "", // Data type: real (10,7). Range: -1.0 to 1.0
        get scaled() { return this._scaled; },
        set scaled(scaled) { this._scaled = scaled; },

        _raw: "", // Data type: real (10,7)
        get raw() { return this._raw; },
        set raw(raw) { this._raw = raw; },

        _min: "", // Data type: real (10,7)
        get min() { return this._min; },
        set min(min) { this._min = min; },

        _max: "", // Data type: real (10,7)
        get max() { return this._max; },
        set max(max) { this._max = max; },

        toJSON: jsonFormatter
      },

      toJSON: jsonFormatter
    };
  }

  function CommentsFromLearnerObject(_API) {
    return {
      _comment: "", // SPM 4000 characters
      get comment() { return this._comment; },
      set comment(comment) { this._comment = comment; },

      _location: "", // SPM 250 characters
      get location() { return this._location; },
      set location(location) { this._location = location; },

      _timestamp: "", // Data type: time (second,10,0) accurate to one second
      get timestamp() { return this._timestamp; },
      set timestamp(timestamp) { this._timestamp = timestamp; },

      toJSON: jsonFormatter
    };
  }

  function CommentsFromLMSObject(API) {
    return {
      _comment: "", // SPM 4000 characters
      get comment() { return this._comment; },
      set comment(comment) { API.isNotInitialized() ? this._comment = comment : API.throwSCORMError(404); },

      _location: "", // SPM 250 characters
      get location() { return this._location; },
      set location(location) { API.isNotInitialized() ? this._location = location : API.throwSCORMError(404); },

      _timestamp: "", // Data type: time (second,10,0) accurate to one second
      get timestamp() { return this._timestamp; },
      set timestamp(timestamp) { API.isNotInitialized() ? this._timestamp = timestamp : API.throwSCORMError(404); },

      toJSON: jsonFormatter
    };
  }

  function InteractionsObject(API) {
    return {
      _id: "", // SPM 4000 characters
      get id() { return this._id; },
      set id(id) { this._id = id; },

      _type: "", // Allowed values: "true-false", "choice", "fill-in", "long-fill-in", "likert", "matching", "performance", "sequencing", "numeric", "other"
      get type() { return this._type; },
      set type(type) { this._type = type; },

      _timestamp: "", // Data type: time (second,10,0) accurate to one second
      get timestamp() { return this._timestamp; },
      set timestamp(timestamp) { this._timestamp = timestamp; },

      _weighting: "", // Data type: real (10,7)
      get weighting() { return this._weighting; },
      set weighting(weighting) { this._weighting = weighting; },

      _learner_response: "", // Data type changes based on interaction's type
      get learner_response() { return this._learner_response; },
      set learner_response(learner_response) { this._learner_response = learner_response; },

      _result: "", // Allowed values: "correct", "incorrect", "unanticipated", "neutral", real(10,7)
      get result() { return this._result; },
      set result(result) { this._result = result; },

      _latency: "", // Data type: timeinterval (second,10,2)
      get latency() { return this._latency; },
      set latency(latency) { this._latency = latency; },

      _description: "", // SPM 250 characters
      get description() { return this._description; },
      set description(description) { this._description = description; },

      objectives: {
        // SPM 10 interaction's objectives
        childArray: [],
        get _count() { return String(this.childArray.length); },
        set _count(_count) { API.throwSCORMError(404); },

        toJSON: jsonFormatter
      },

      correct_responses: {
        // SPM changes based on interaction's type
        childArray: [],
        get _count() { return String(this.childArray.length); },
        set _count(_count) { API.throwSCORMError(404); },

        toJSON: jsonFormatter
      },

      toJSON: jsonFormatter
    };
  }

  function InteractionsObjectivesObject(_API) {
    return {
      _id: "", // SPM 4000 characters
      get id() { return this._id; },
      set id(id) { this._id = id; },

      toJSON: jsonFormatter
    };
  }

  function InteractionsCorrectResponsesObject(_API) {
    return {
      _pattern: "", // Data type changes based on interaction's type
      get pattern() { return this._pattern; },
      set pattern(pattern) { this._pattern = pattern; },

      toJSON: jsonFormatter
    };
  }

  function ObjectivesObject(API) {
    return {
      _id: "", // SPM 4000 characters
      get id() { return this._id; },
      set id(id) { this._id = id; },

      _success_status: "unknown", // Allowed values: "passed", "failed", "unknown"
      get success_status() { return this._success_status; },
      set success_status(success_status) { this._success_status = success_status; },

      _completion_status: "unknown", // Allowed values: "completed", "incomplete", "not attempted", "unknown"
      get completion_status() { return this._completion_status; },
      set completion_status(completion_status) { this._completion_status = completion_status; },

      _progress_measure: "", // Data type: real (10,7). Range: 0.0 to 1.0
      get progress_measure() { return this._progress_measure; },
      set progress_measure(progress_measure) { this._progress_measure = progress_measure; },

      _description: "", // SPM 250 characters
      get description() { return this._description; },
      set description(description) { this._description = description; },

      score: {
        __children: "scaled,raw,min,max",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(404); },

        _scaled: "", // Data type: real (10,7). Range: -1.0 to 1.0
        get scaled() { return this._scaled; },
        set scaled(scaled) { this._scaled = scaled; },

        _raw: "", // Data type: real (10,7)
        get raw() { return this._raw; },
        set raw(raw) { this._raw = raw; },

        _min: "", // Data type: real (10,7)
        get min() { return this._min; },
        set min(min) { this._min = min; },

        _max: "", // Data type: real (10,7)
        get max() { return this._max; },
        set max(max) { this._max = max; },

        toJSON: jsonFormatter
      },

      toJSON: jsonFormatter
    };
  }

  /**
   * Adl data model
   */
  function ADL(API) {
    return {
      nav: {
        _request: "_none_", // Allowed values: "continue", "previous", "choice", "jump", "exit", "exitAll", "abandon", "abandonAll", "_none_"
        get request() { return this._request; },
        set request(request) { this._request = request; },

        request_valid: {
          _continue: "unknown", // Allowed values: "true", "false", "unknown"
          get continue() { return this._continue; },
          set continue(_) { API.throwSCORMError(404); },

          _previous: "unknown", // Allowed values: "true", "false", "unknown"
          get previous() { return this._previous; },
          set previous(_) { API.throwSCORMError(404); },

          choice: {
            _isTargetValid: adlNavRequestValidChoice
          },

          jump: {
            _isTargetValid: adlNavRequestValidJump
          }
        }
      }
    };
  }

  /**
   * Determine if the choice request is valid
   */
  function adlNavRequestValidChoice(_target) {
    return "unknown";
  }

  /**
   * Determine if the jump request is valid
   */
  function adlNavRequestValidJump(_target) {
    return "unknown";
  }

  /**
   * Determine the completion_status of a cmi object
   */
  function getCompletionStatus(cmi) {
    var completion_status = cmi._completion_status;

    if (cmi._completion_threshold && cmi._progress_measure) {
      completion_status = cmi._progress_measure >= cmi._completion_threshold ? "completed" : "incomplete";
    } else if (cmi._completion_threshold) {
      completion_status = "unknown";
    }

    return completion_status;
  }

  /**
   * Determine the success_status of a cmi object
   */
  function getSuccessStatus(cmi) {
    var success_status = cmi._success_status;

    if (cmi._scaled_passing_score && cmi.score._scaled) {
      success_status = cmi.score._scaled >= cmi._scaled_passing_score ? "passed" : "failed";
    } else if (cmi._scaled_passing_score) {
      success_status = "unknown";
    }

    return success_status;
  }
})();
