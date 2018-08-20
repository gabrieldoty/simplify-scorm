(function() {
  /**
   * Based on the Scorm 1.2 definitions from https://scorm.com
   *
   * Scorm 1.2 Overview for Developers: https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
   * Run-Time Reference: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
   */
  window.simplifyScorm.ScormAPI = ScormAPI;

  var BaseAPI = window.simplifyScorm.BaseAPI;
  var constants = window.simplifyScorm.constants;
  var jsonFormatter = window.simplifyScorm.jsonFormatter;

  window.API = new ScormAPI();

  function ScormAPI() {
    var _self = this;

    BaseAPI.call(_self);

    // API Signature
    _self.LMSInitialize = LMSInitialize;
    _self.LMSFinish = LMSFinish;
    _self.LMSGetValue = LMSGetValue;
    _self.LMSSetValue = LMSSetValue;
    _self.LMSCommit = LMSCommit;
    _self.LMSGetLastError = LMSGetLastError;
    _self.LMSGetErrorString = LMSGetErrorString;
    _self.LMSGetDiagnostic = LMSGetDiagnostic;

    // Data Model
    _self.cmi = new CMI(_self);

    // Utility Functions
    _self.checkState = checkState;
    _self.getLmsErrorMessageDetails = getLmsErrorMessageDetails;
    _self.loadFromJSON = loadFromJSON;
    _self.replaceWithAnotherScormAPI = replaceWithAnotherScormAPI;

    /**
     * @returns {string} bool
     */
    function LMSInitialize() {
      var returnValue = constants.SCORM_FALSE;

      if (_self.isInitialized()) {
        _self.throwSCORMError(101, "LMS was already initialized!");
      } else if (_self.isTerminated()) {
        _self.throwSCORMError(101, "LMS is already finished!");
      } else {
        _self.currentState = constants.STATE_INITIALIZED;
        returnValue = constants.SCORM_TRUE;
        _self.processListeners("LMSInitialize");
      }

      _self.apiLog("LMSInitialize", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * @returns {string} bool
     */
    function LMSFinish() {
      var returnValue = constants.SCORM_FALSE;

      if (_self.checkState()) {
        _self.currentState = constants.STATE_TERMINATED;
        returnValue = constants.SCORM_TRUE;
        _self.processListeners("LMSFinish");
      }

      _self.apiLog("LMSFinish", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * @param CMIElement
     * @returns {string}
     */
    function LMSGetValue(CMIElement) {
      var returnValue = "";

      if (_self.checkState()) {
        returnValue = getCMIValue(CMIElement);
        _self.processListeners("LMSGetValue", CMIElement);
      }

      _self.apiLog("LMSGetValue", CMIElement, ": returned: " + returnValue, constants.LOG_LEVEL_INFO);
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

      if (_self.checkState()) {
        returnValue = setCMIValue(CMIElement, value);
        _self.processListeners("LMSSetValue", CMIElement, value);
      }

      _self.apiLog("LMSSetValue", CMIElement, ": " + value + ": returned: " + returnValue, constants.LOG_LEVEL_INFO);
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

      if (_self.checkState()) {
        returnValue = constants.SCORM_TRUE;
        _self.processListeners("LMSCommit");
      }

      _self.apiLog("LMSCommit", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);
      _self.clearSCORMError(returnValue);

      return returnValue;
    }

    /**
     * Returns last error code
     *
     * @returns {string}
     */
    function LMSGetLastError() {
      var returnValue = _self.lastErrorCode;

      _self.processListeners("LMSGetLastError");

      _self.apiLog("LMSGetLastError", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);

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
        _self.processListeners("LMSGetErrorString");
      }

      _self.apiLog("LMSGetErrorString", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);

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
        _self.processListeners("LMSGetDiagnostic");
      }

      _self.apiLog("LMSGetDiagnostic", null, "returned: " + returnValue, constants.LOG_LEVEL_INFO);

      return returnValue;
    }

    /**
     * Checks the LMS state and ensures it has been initialized
     */
    function checkState() {
      if (!this.isInitialized()) {
        this.throwSCORMError(301);
        return false;
      }

      return true;
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
      var found = constants.SCORM_FALSE;

      for (var i = 0; i < structure.length; i++) {
        if (i === structure.length - 1) {
          if (!refObject.hasOwnProperty(structure[i])) {
            _self.throwSCORMError(101, "setCMIValue did not find an element for: " + CMIElement);
          } else {
            refObject[structure[i]] = value;
            found = constants.SCORM_TRUE;
          }
        } else {
          refObject = refObject[structure[i]];
          if (!refObject) {
            _self.throwSCORMError(101, "setCMIValue did not find an element for: " + CMIElement);
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

                if (CMIElement.indexOf("cmi.objectives") > -1) {
                  newChild = new CMI_ObjectivesObject(_self);
                } else if (CMIElement.indexOf(".correct_responses") > -1) {
                  newChild = new CMI_InteractionsCorrectResponsesObject(_self);
                } else if (CMIElement.indexOf(".objectives") > -1) {
                  newChild = new CMI_InteractionsObjectivesObject(_self);
                } else if (CMIElement.indexOf("cmi.interactions") > -1) {
                  newChild = new CMI_InteractionsObject(_self);
                }

                if (!newChild) {
                  _self.throwSCORMError(101, "Cannot create new sub entity: " + CMIElement);
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

      if (found === constants.SCORM_FALSE) {
        _self.apiLog("LMSSetValue", null, "There was an error setting the value for: " + CMIElement + ", value of: " + value, constants.LOG_LEVEL_WARNING);
      }

      return found;
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
      var lastProperty = null;

      for (var i = 0; i < structure.length; i++) {
        lastProperty = structure[i];

        if (i === structure.length - 1) {
          if (!refObject.hasOwnProperty(structure[i])) {
            _self.throwSCORMError(101, "getCMIValue did not find a value for: " + CMIElement);
          }
        }

        refObject = refObject[structure[i]];
      }

      if (refObject === null || refObject === undefined) {
        if (lastProperty === "_children") {
          _self.throwSCORMError(202);
        } else if (lastProperty === "_count") {
          _self.throwSCORMError(203);
        }
        return "";
      } else {
        return refObject;
      }
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
        case "101":
          basicMessage = "General Exception";
          detailMessage = "No specific error code exists to describe the error. Use LMSGetDiagnostic for more information";
          break;

        case "201":
          basicMessage = "Invalid argument error";
          detailMessage = "Indicates that an argument represents an invalid data model element or is otherwise incorrect.";
          break;

        case "202":
          basicMessage = "Element cannot have children";
          detailMessage = "Indicates that LMSGetValue was called with a data model element name that ends in \"_children\" for a data model element that does not support the \"_children\" suffix.";
          break;

        case "203":
          basicMessage = "Element not an array - cannot have count";
          detailMessage = "Indicates that LMSGetValue was called with a data model element name that ends in \"_count\" for a data model element that does not support the \"_count\" suffix.";
          break;

        case "301":
          basicMessage = "Not initialized";
          detailMessage = "Indicates that an API call was made before the call to LMSInitialize.";
          break;

        case "401":
          basicMessage = "Not implemented error";
          detailMessage = "The data model element indicated in a call to LMSGetValue or LMSSetValue is valid, but was not implemented by this LMS. SCORM 1.2 defines a set of data model elements as being optional for an LMS to implement.";
          break;

        case "402":
          basicMessage = "Invalid set value, element is a keyword";
          detailMessage = "Indicates that LMSSetValue was called on a data model element that represents a keyword (elements that end in \"_children\" and \"_count\").";
          break;

        case "403":
          basicMessage = "Element is read only";
          detailMessage = "LMSSetValue was called with a data model element that can only be read.";
          break;

        case "404":
          basicMessage = "Element is write only";
          detailMessage = "LMSGetValue was called on a data model element that can only be written to.";
          break;

        case "405":
          basicMessage = "Incorrect Data Type";
          detailMessage = "LMSSetValue was called with a value that is not consistent with the data format of the supplied data model element.";
          break;

        default:
          basicMessage = "No Error";
          detailMessage = "No Error";
          break;
      }

      return detail ? detailMessage : basicMessage;
    }

    /**
     * Loads CMI data from a JSON object.
     */
    function loadFromJSON(json, CMIElement) {
      if (!_self.isNotInitialized()) {
        console.error("loadFromJSON can only be called before the call to LMSInitialize.");
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
     * Replace the whole API with another
     */
    function replaceWithAnotherScormAPI(newAPI) {
      // API Signature
      _self.LMSInitialize = newAPI.LMSInitialize;
      _self.LMSFinish = newAPI.LMSFinish;
      _self.LMSGetValue = newAPI.LMSGetValue;
      _self.LMSSetValue = newAPI.LMSSetValue;
      _self.LMSCommit = newAPI.LMSCommit;
      _self.LMSGetLastError = newAPI.LMSGetLastError;
      _self.LMSGetErrorString = newAPI.LMSGetErrorString;
      _self.LMSGetDiagnostic = newAPI.LMSGetDiagnostic;

      // Data Model
      _self.cmi = newAPI.cmi;

      // Utility Functions
      _self.checkState = newAPI.checkState;
      _self.getLmsErrorMessageDetails = newAPI.getLmsErrorMessageDetails;
      _self.loadFromJSON = newAPI.loadFromJSON;
      _self.replaceWithAnotherScormAPI = newAPI.replaceWithAnotherScormAPI;

      // API itself
      _self = newAPI; // eslint-disable-line consistent-this
    }

    return _self;
  }

  /**
   * Scorm 1.2 Cmi data model
   */
  function CMI(API) {
    return {
      _suspend_data: "",
      get suspend_data() { return this._suspend_data; },
      set suspend_data(suspend_data) { this._suspend_data = suspend_data; },

      _launch_data: "",
      get launch_data() { return this._launch_data; },
      set launch_data(launch_data) { API.isNotInitialized() ? this._launch_data = launch_data : API.throwSCORMError(403); },

      _comments: "",
      get comments() { return this._comments; },
      set comments(comments) { this._comments = comments; },

      _comments_from_lms: "",
      get comments_from_lms() { return this._comments_from_lms; },
      set comments_from_lms(comments_from_lms) { API.isNotInitialized() ? this._comments_from_lms = comments_from_lms : API.throwSCORMError(403); },

      core: {
        __children: "student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(402); },

        _student_id: "",
        get student_id() { return this._student_id; },
        set student_id(student_id) { API.isNotInitialized() ? this._student_id = student_id : API.throwSCORMError(403); },

        _student_name: "",
        get student_name() { return this._student_name; },
        set student_name(student_name) { API.isNotInitialized() ? this._student_name = student_name : API.throwSCORMError(403); },

        _lesson_location: "",
        get lesson_location() { return this._lesson_location; },
        set lesson_location(lesson_location) { this._lesson_location = lesson_location; },

        _credit: "",
        get credit() { return this._credit; },
        set credit(credit) { API.isNotInitialized() ? this._credit = credit : API.throwSCORMError(403); },

        _lesson_status: "",
        get lesson_status() { return this._lesson_status; },
        set lesson_status(lesson_status) { this._lesson_status = lesson_status; },

        _entry: "",
        get entry() { return this._entry; },
        set entry(entry) { API.isNotInitialized() ? this._entry = entry : API.throwSCORMError(403); },

        _total_time: "",
        get total_time() { return this._total_time; },
        set total_time(total_time) { API.isNotInitialized() ? this._total_time = total_time : API.throwSCORMError(403); },

        _lesson_mode: "normal",
        get lesson_mode() { return this._lesson_mode; },
        set lesson_mode(lesson_mode) { API.isNotInitialized() ? this._lesson_mode = lesson_mode : API.throwSCORMError(403); },

        _exit: "",
        get exit() { return (!this.jsonString) ? API.throwSCORMError(404) : this._exit; },
        set exit(exit) { this._exit = exit; },

        _session_time: "",
        get session_time() { return (!this.jsonString) ? API.throwSCORMError(404) : this._session_time; },
        set session_time(session_time) { this._session_time = session_time; },

        score: {
          __children: "raw,min,max",
          get _children() { return this.__children; },
          set _children(_children) { API.throwSCORMError(402); },

          _raw: "",
          get raw() { return this._raw; },
          set raw(raw) { this._raw = raw; },

          _min: "",
          get min() { return this._min; },
          set min(min) { this._min = min; },

          _max: "100",
          get max() { return this._max; },
          set max(max) { this._max = max; },

          toJSON: jsonFormatter
        },

        toJSON: jsonFormatter
      },

      objectives: {
        __children: "id,score,status",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(402); },

        childArray: [],
        get _count() { return this.childArray.length; },
        set _count(_count) { API.throwSCORMError(402); },

        toJSON: jsonFormatter
      },

      student_data: {
        __children: "mastery_score,max_time_allowed,time_limit_action",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(402); },

        _mastery_score: "",
        get mastery_score() { return this._mastery_score; },
        set mastery_score(mastery_score) { API.isNotInitialized() ? this._mastery_score = mastery_score : API.throwSCORMError(403); },

        _max_time_allowed: "",
        get max_time_allowed() { return this._max_time_allowed; },
        set max_time_allowed(max_time_allowed) { API.isNotInitialized() ? this._max_time_allowed = max_time_allowed : API.throwSCORMError(403); },

        _time_limit_action: "",
        get time_limit_action() { return this._time_limit_action; },
        set time_limit_action(time_limit_action) { API.isNotInitialized() ? this._time_limit_action = time_limit_action : API.throwSCORMError(403); },

        toJSON: jsonFormatter
      },

      student_preference: {
        __children: "audio,language,speed,text",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(402); },

        _audio: "",
        get audio() { return this._audio; },
        set audio(audio) { this._audio = audio; },

        _language: "",
        get language() { return this._language; },
        set language(language) { this._language = language; },

        _speed: "",
        get speed() { return this._speed; },
        set speed(speed) { this._speed = speed; },

        _text: "",
        get text() { return this._text; },
        set text(text) { this._text = text; },

        toJSON: jsonFormatter
      },

      interactions: {
        __children: "id,objectives,time,type,correct_responses,weighting,student_response,result,latency",
        get _children() { return this.__children; },
        set _children(_children) { API.throwSCORMError(402); },

        childArray: [],
        get _count() { return this.childArray.length; },
        set _count(_count) { API.throwSCORMError(402); },

        toJSON: jsonFormatter
      },

      toJSON: jsonFormatter
    };
  }

  function CMI_InteractionsObject(API) {
    return {
      _id: "",
      get id() { return (!this.jsonString) ? API.throwSCORMError(404) : this._id; },
      set id(id) { this._id = id; },

      _time: "",
      get time() { return (!this.jsonString) ? API.throwSCORMError(404) : this._time; },
      set time(time) { this._time = time; },

      _type: "",
      get type() { return (!this.jsonString) ? API.throwSCORMError(404) : this._type; },
      set type(type) { this._type = type; },

      _weighting: "",
      get weighting() { return (!this.jsonString) ? API.throwSCORMError(404) : this._weighting; },
      set weighting(weighting) { this._weighting = weighting; },

      _student_response: "",
      get student_response() { return (!this.jsonString) ? API.throwSCORMError(404) : this._student_response; },
      set student_response(student_response) { this._student_response = student_response; },

      _result: "",
      get result() { return (!this.jsonString) ? API.throwSCORMError(404) : this._result; },
      set result(result) { this._result = result; },

      _latency: "",
      get latency() { return (!this.jsonString) ? API.throwSCORMError(404) : this._latency; },
      set latency(latency) { this._latency = latency; },

      objectives: {
        childArray: [],
        get _count() { return this.childArray.length; },
        set _count(_count) { API.throwSCORMError(402); },

        toJSON: jsonFormatter
      },

      correct_responses: {
        childArray: [],
        get _count() { return this.childArray.length; },
        set _count(_count) { API.throwSCORMError(402); },

        toJSON: jsonFormatter
      },

      toJSON: jsonFormatter
    };
  }

  function CMI_ObjectivesObject(API) {
    return {
      _id: "",
      get id() { return this._id; },
      set id(id) { this._id = id; },

      _status: "",
      get status() { return this._status; },
      set status(status) { this._status = status; },

      score: {
        __children: "raw,min,max",
        get _children() { return this.__children; },
        set _children(children) { API.throwSCORMError(402); },

        _raw: "",
        get raw() { return this._raw; },
        set raw(raw) { this._raw = raw; },

        _min: "",
        get min() { return this._min; },
        set min(min) { this._min = min; },

        _max: "",
        get max() { return this._max; },
        set max(max) { this._max = max; },

        toJSON: jsonFormatter
      },

      toJSON: jsonFormatter
    };
  }

  function CMI_InteractionsObjectivesObject(API) {
    return {
      _id: "",
      get id() { return (!this.jsonString) ? API.throwSCORMError(404) : this._id; },
      set id(id) { this._id = id; },

      toJSON: jsonFormatter
    };
  }

  function CMI_InteractionsCorrectResponsesObject(API) {
    return {
      _pattern: "",
      get pattern() { return (!this.jsonString) ? API.throwSCORMError(404) : this._pattern; },
      set pattern(pattern) { this._pattern = pattern; },

      toJSON: jsonFormatter
    };
  }
})();
