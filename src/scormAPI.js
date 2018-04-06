(function() {
    /**
     * Based on the Scorm 1.2 definitions from https://scorm.com
     *
     * Scorm 1.2 Overview for Developers: https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/
     * Run-Time Reference: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
     */
    window.API = new ScormAPI();

    var SCORM_TRUE = 'true';
    var SCORM_FALSE = 'false';

    var STATE_NOT_INITIALIZED = 0;
    var STATE_INITIALIZED = 1;
    var STATE_TERMINATED = 2;

    var LOG_LEVEL_DEBUG = 1;
    var LOG_LEVEL_INFO = 2;
    var LOG_LEVEL_WARNING = 3;
    var LOG_LEVEL_ERROR = 4;
    var LOG_LEVEL_NONE = 5;

    function BaseAPI() {
        var _self = this;

        // Internal State
        _self.currentState = STATE_NOT_INITIALIZED;
        _self.lastErrorCode = 0;

        // Utility Functions
        _self.apiLogLevel = LOG_LEVEL_ERROR;
        _self.apiLog = apiLog;
        _self.on = onListener;
        _self.listenerArray = [];
        _self.processListeners = processListeners;
        _self.throwSCORMError = throwSCORMError;
    }

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

        /**
         * @returns {string} bool
         */
        function LMSInitialize() {
            var returnValue = SCORM_FALSE;

            if (_self.currentState === STATE_INITIALIZED) {
                _self.throwSCORMError(101, 'LMS was already initialized!');
            }
            else {
                _self.currentState = STATE_INITIALIZED;
                returnValue = SCORM_TRUE;
                _self.processListeners('LMSInitialize');
            }

            _self.apiLog('LMSInitialize', null, 'returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * @returns {string} bool
         */
        function LMSFinish() {
            var returnValue = SCORM_FALSE;

            if (_self.checkState()) {
                returnValue = SCORM_TRUE;
                _self.processListeners('LMSFinish');
            }

            _self.apiLog('LMSFinish', null, 'returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * @param CMIElement
         * @returns {string}
         */
        function LMSGetValue(CMIElement) {
            var returnValue = '';

            if (_self.checkState()) {
                returnValue = getCMIValue(CMIElement);
                _self.processListeners('LMSGetValue', CMIElement);
            }

            _self.apiLog('LMSGetValue', CMIElement, ': returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * @param CMIElement
         * @param value
         * @returns {string}
         */
        function LMSSetValue(CMIElement, value) {
            var returnValue = '';

            if (_self.checkState()) {
                setCMIValue(CMIElement, value);
                _self.processListeners('LMSSetValue', CMIElement, value);
            }

            _self.apiLog('LMSSetValue', CMIElement, ': ' + value + ': result: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * Orders LMS to store all content parameters
         *
         * @returns {string} bool
         */
        function LMSCommit() {
            var returnValue = SCORM_FALSE;

            if (_self.checkState()) {
                returnValue = SCORM_TRUE;
                _self.processListeners('LMSCommit');
            }

            _self.apiLog('LMSCommit', null, 'returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * Returns last error code
         *
         * @returns {string}
         */
        function LMSGetLastError() {
            var returnValue = _self.lastErrorCode;

            _self.processListeners('LMSGetLastError');

            _self.apiLog('LMSGetLastError', null, 'returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * Returns the errorNumber error description
         *
         * @param CMIErrorCode
         * @returns {string}
         */
        function LMSGetErrorString(CMIErrorCode) {
            var returnValue = '';

            if (CMIErrorCode !== null && CMIErrorCode !== '') {
                returnValue = getLmsErrorMessageDetails(CMIErrorCode);
                _self.processListeners('LMSGetErrorString');
            }

            _self.apiLog('LMSGetErrorString', null, 'returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * Returns a comprehensive description of the errorNumber error.
         *
         * @param CMIErrorCode
         * @returns {string}
         */
        function LMSGetDiagnostic(CMIErrorCode) {
            var returnValue = '';

            if (CMIErrorCode !== null && CMIErrorCode !== '') {
                returnValue = getLmsErrorMessageDetails(CMIErrorCode, true);
                _self.processListeners('LMSGetDiagnostic');
            }

            _self.apiLog('LMSGetDiagnostic', null, 'returned: ' + returnValue, LOG_LEVEL_INFO);

            return returnValue;
        }

        /**
         * Checks the LMS state and ensures it has been initialized
         */
        function checkState() {
            if (this.currentState !== STATE_INITIALIZED) {
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
            if (!CMIElement || CMIElement === '') {
                return SCORM_FALSE;
            }

            var structure = CMIElement.split('.');
            var refObject = _self;
            var found = SCORM_FALSE;

            for (var i = 0; i < structure.length; i++) {
                if (i === structure.length - 1) {
                    if (!refObject.hasOwnProperty(structure[i])) {
                        _self.throwSCORMError(101, 'setCMIValue did not find an element for: ' + CMIElement);
                    }
                    else {
                        refObject[structure[i]] = value;
                        found = SCORM_TRUE;
                    }
                }
                else {
                    refObject = refObject[structure[i]];

                    if (refObject.hasOwnProperty('childArray')) {
                        var index = parseInt(structure[i + 1]);

                        // SCO is trying to set an item on an array
                        if (!isNaN(index)) {
                            var item = refObject.childArray[index];

                            if (item) {
                                refObject = item;
                            }
                            else {
                                var newChild;

                                if (CMIElement.indexOf('cmi.objectives') > -1) {
                                    newChild = new CMI_ObjectivesObject(_self);
                                }
                                else if (CMIElement.indexOf('.correct_responses') > -1) {
                                    newChild = new CMI_InteractionsCorrectResponsesObject(_self);
                                }
                                else if (CMIElement.indexOf('.objectives') > -1) {
                                    newChild = new CMI_InteractionsObjectivesObject(_self);
                                }
                                else if (CMIElement.indexOf('cmi.interactions') > -1) {
                                    newChild = new CMI_InteractionsObject(_self);
                                }

                                if (!newChild) {
                                    _self.throwSCORMError(101, 'Cannot create new sub entity: ' + CMIElement);
                                }
                                else {
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

            if (found === SCORM_FALSE) {
                _self.apiLog('There was an error setting the value for: ' + CMIElement + ', value of: ' + value, LOG_LEVEL_WARNING);
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
            if (!CMIElement || CMIElement === '') {
                return '';
            }

            var structure = CMIElement.split('.');
            var refObject = _self;
            var lastProperty = null;

            for (var i = 0; i < structure.length; i++) {
                lastProperty = structure[i];

                if (i === structure.length - 1) {
                    if (!refObject.hasOwnProperty(structure[i])) {
                        _self.throwSCORMError(101, 'getCMIValue did not find a value for: ' + CMIElement);
                    }
                }

                refObject = refObject[structure[i]];
            }

            if (refObject === null || refObject === undefined) {
                if (lastProperty === '_children') {
                    _self.throwSCORMError(202);
                }
                else if (lastProperty === '_count') {
                    _self.throwSCORMError(203);
                }
                return '';
            }
            else {
                return refObject;
            }
        }

        /**
         * Returns the message that corresponds to errrorNumber.
         */
        function getLmsErrorMessageDetails(errorNumber, detail) {
            var basicMessage = '';
            var detailMessage = '';

            // Set error number to string since inconsistent from modules if string or number
            errorNumber = String(errorNumber);

            switch (errorNumber) {
                case '101':
                    basicMessage = 'General Exception';
                    detailMessage = 'No specific error code exists to describe the error. Use LMSGetDiagnostic for more information';
                    break;

                case '201':
                    basicMessage = 'Invalid argument error';
                    detailMessage = 'Indicates that an argument represents an invalid data model element or is otherwise incorrect.';
                    break;

                case '202':
                    basicMessage = 'Element cannot have children';
                    detailMessage =
                        'Indicates that LMSGetValue was called with a data model element name that ends in “_children” for a data model element that does not support the “_children” suffix.';
                    break;

                case '203':
                    basicMessage = 'Element not an array - cannot have count';
                    detailMessage =
                        'Indicates that LMSGetValue was called with a data model element name that ends in “_count” for a data model element that does not support the “_count” suffix.';
                    break;

                case '301':
                    basicMessage = 'Not initialized';
                    detailMessage = 'Indicates that an API call was made before the call to LMSInitialize.';
                    break;

                case '401':
                    basicMessage = 'Not implemented error';
                    detailMessage =
                        'The data model element indicated in a call to LMSGetValue or LMSSetValue is valid, but was not implemented by this LMS. SCORM 1.2 defines a set of data model elements as being optional for an LMS to implement.';
                    break;

                case '402':
                    basicMessage = 'Invalid set value, element is a keyword';
                    detailMessage =
                        'Indicates that LMSSetValue was called on a data model element that represents a keyword (elements that end in “_children” and “_count”).';
                    break;

                case '403':
                    basicMessage = 'Element is read only';
                    detailMessage = 'LMSSetValue was called with a data model element that can only be read.';
                    break;

                case '404':
                    basicMessage = 'Element is write only';
                    detailMessage = 'LMSGetValue was called on a data model element that can only be written to.';
                    break;

                case '405':
                    basicMessage = 'Incorrect Data Type';
                    detailMessage = 'LMSSetValue was called with a value that is not consistent with the data format of the supplied data model element.';
                    break;

                default:
                    basicMessage = 'No Error';
                    detailMessage = 'No Error';
                    break;
            }

            if (detail) {
                return detailMessage;
            }
            else {
                return basicMessage;
            }
        }

        return _self;
    }

    /**
     * Scorm 1.2 Cmi data model
     */
    function CMI(API) {
        return {
            jsonString: false,
            _suspend_data: '',
            _launch_data: '',
            _comments: '',
            _comments_from_lms: '',

            get suspend_data() {
                return this._suspend_data;
            },
            set suspend_data(suspend_data) {
                this._suspend_data = suspend_data;
            },
            get launch_data() {
                return this._launch_data;
            },
            set launch_data(launch_data) {
                if (API.currentState !== STATE_INITIALIZED) {
                    this._launch_data = launch_data;
                }
                else {
                    API.throwSCORMError(403);
                }
            },
            get comments() {
                return this._comments;
            },
            set comments(comments) {
                this._comments = comments;
            },
            get comments_from_lms() {
                return this._comments_from_lms;
            },
            set comments_from_lms(comments_from_lms) {
                if (API.currentState !== STATE_INITIALIZED) {
                    this._comments_from_lms = comments_from_lms;
                }
                else {
                    API.throwSCORMError(403);
                }
            },
            core: {
                jsonString: false,

                __children: 'student_id, student_name, lesson_location, credit, lesson_status, entry, score, total_time, lesson_mode, exit, session_time',

                _student_id: '',
                _student_name: '',
                _lesson_location: '',
                _credit: '',
                _lesson_status: '',
                _total_time: '',
                _lesson_mode: 'normal',
                _exit: '',
                _session_time: '',

                get _children() {
                    return this.__children;
                },
                set _children(__children) {
                    API.throwSCORMError(402);
                },

                get student_id() {
                    return this._student_id;
                },
                set student_id(student_id) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._student_id = student_id;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get student_name() {
                    return this._student_name;
                },
                set student_name(student_name) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._student_name = student_name;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get lesson_location() {
                    return this._lesson_location;
                },
                set lesson_location(lesson_location) {
                    this._lesson_location = lesson_location;
                },
                get credit() {
                    return this._credit;
                },
                set credit(credit) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._credit = credit;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get lesson_status() {
                    return this._lesson_status;
                },
                set lesson_status(lesson_status) {
                    this._lesson_status = lesson_status;
                },
                get entry() {
                    return this._entry;
                },
                set entry(entry) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._entry = entry;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get total_time() {
                    return this._total_time;
                },
                set total_time(total_time) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._total_time = total_time;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get lesson_mode() {
                    return this._lesson_mode;
                },
                set lesson_mode(lesson_mode) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._lesson_mode = lesson_mode;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get exit() {
                    if (!this.jsonString) {
                        API.throwSCORMError(404);
                    }
                    else {
                        return this._exit;
                    }
                },
                set exit(exit) {
                    this._exit = exit;
                },
                get session_time() {
                    if (!this.jsonString) {
                        API.throwSCORMError(404);
                    }
                    else {
                        return this._session_time;
                    }
                },
                set session_time(session_time) {
                    this._session_time = session_time;
                },

                score: {
                    __children: 'raw,min,max',
                    _raw: '',
                    _max: '100',
                    _min: '',

                    get _children() {
                        return this.__children;
                    },
                    set _children(_children) {
                        API.throwSCORMError(402);
                    },
                    get raw() {
                        return this._raw;
                    },
                    set raw(raw) {
                        this._raw = raw;
                    },
                    get max() {
                        return this._max;
                    },
                    set max(max) {
                        this._max = max;
                    },
                    get min() {
                        return this._min;
                    },
                    set min(min) {
                        this._min = min;
                    },
                    toJSON: jsonFormatter
                },
                toJSON: jsonFormatter
            },
            objectives: {
                __children: 'id,score,status',
                childArray: [],

                get _children() {
                    return this.__children;
                },
                set _children(_children) {
                    API.throwSCORMError(402);
                },
                get _count() {
                    return this.childArray.length;
                },
                set _count(count) {
                    API.throwSCORMError(402);
                },
                toJSON: jsonFormatter
            },
            student_data: {
                __children: 'mastery_score,max_time_allowed,time_limit_action',
                _mastery_score: '',
                _max_time_allowed: '',
                _time_limit_action: '',

                get _children() {
                    return this.__children;
                },
                set _children(_children) {
                    API.throwSCORMError(402);
                },
                get mastery_score() {
                    return this._mastery_score;
                },
                set mastery_score(mastery_score) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._mastery_score = mastery_score;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get max_time_allowed() {
                    return this._max_time_allowed;
                },
                set max_time_allowed(max_time_allowed) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._max_time_allowed = max_time_allowed;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                get time_limit_action() {
                    return this._time_limit_action;
                },
                set time_limit_action(time_limit_action) {
                    if (API.currentState !== STATE_INITIALIZED) {
                        this._time_limit_action = time_limit_action;
                    }
                    else {
                        API.throwSCORMError(403);
                    }
                },
                toJSON: jsonFormatter
            },
            student_preference: {
                __children: 'language,speech,audio,speed,text',
                get _children() {
                    return this.__children;
                },
                set _children(_children) {
                    API.throwSCORMError(402);
                },

                _audio: '',
                _language: '',
                _speed: '',
                _text: '',

                get audio() {
                    return this._audio;
                },
                set audio(audio) {
                    this._audio = audio;
                },
                get language() {
                    return this._language;
                },
                set language(language) {
                    this._language = language;
                },
                get speed() {
                    return this._speed;
                },
                set speed(speed) {
                    this._speed = speed;
                },
                get text() {
                    return this._text;
                },
                set text(text) {
                    this._text = text;
                },
                toJSON: jsonFormatter
            },
            interactions: {
                __children: 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency',
                childArray: [],

                get _children() {
                    return this.__children;
                },
                set _children(_children) {
                    API.throwSCORMError(402);
                },
                get _count() {
                    return this.childArray.length;
                },
                set _count(_count) {
                    API.throwSCORMError(402);
                },
                toJSON: jsonFormatter
            },
            toJSON: jsonFormatter
        };
    }

    function CMI_InteractionsObject(API) {
        return {
            jsonString: false,
            _id: '',
            _time: '',
            _type: '',
            _weighting: '',
            _student_response: '',
            _result: '',
            _latency: '',

            get id() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._id;
                }
            },
            set id(id) {
                this._id = id;
            },
            get time() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._time;
                }
            },
            set time(time) {
                this._time = time;
            },
            get type() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._type;
                }
            },
            set type(type) {
                this._type = type;
            },
            get weighting() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._weighting;
                }
            },
            set weighting(weighting) {
                this._weighting = weighting;
            },
            get student_response() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._student_response;
                }
            },
            set student_response(student_response) {
                this._student_response = student_response;
            },
            get result() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._result;
                }
            },
            set result(result) {
                this._result = result;
            },
            get latency() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._latency;
                }
            },
            set latency(latency) {
                this._latency = latency;
            },
            objectives: {
                childArray: [],

                get _count() {
                    return this.childArray.length;
                },
                set _count(_count) {
                    API.throwSCORMError(402);
                },
                toJSON: jsonFormatter
            },
            correct_responses: {
                childArray: [],

                get _count() {
                    return this.childArray.length;
                },
                set _count(_count) {
                    API.throwSCORMError(402);
                },
                toJSON: jsonFormatter
            },
            toJSON: jsonFormatter
        }
    }

    function CMI_ObjectivesObject(API) {
        return {
            _id: '',
            get id() {
                return this._id;
            },
            set id(id) {
                this._id = id;
            },
            score: {
                __children: 'raw,min,max',
                get _children() {
                    return this.__children;
                },
                set _children(children) {
                    API.throwSCORMError(402);
                },

                _raw: '',
                _max: '',
                _min: '',
                _status: '',

                get raw() {
                    return this._raw;
                },
                set raw(raw) {
                    this._raw = raw;
                },
                get max() {
                    return this._max;
                },
                set max(max) {
                    this._max = max;
                },
                get min() {
                    return this._min;
                },
                set min(min) {
                    this._min = min;
                },
                get status() {
                    return this._status;
                },
                set status(status) {
                    this._status = status;
                },
                toJSON: jsonFormatter
            },
            toJSON: jsonFormatter
        }
    }

    function CMI_InteractionsObjectivesObject(API) {
        return {
            jsonString: false,
            _id: '',

            get id() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._id;
                }
            },
            set id(id) {
                this._id = id;
            },
            toJSON: jsonFormatter
        };
    }

    function CMI_InteractionsCorrectResponsesObject(API) {
        return {
            jsonString: false,
            _pattern: '',

            get pattern() {
                if (!this.jsonString) {
                    API.throwSCORMError(404);
                }
                else {
                    return this._pattern;
                }
            },
            set pattern(pattern) {
                this._pattern = pattern;
            },
            toJSON: jsonFormatter
        };
    }

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
                case LOG_LEVEL_ERROR:
                    console.error(logMessage);
                    break;
                case LOG_LEVEL_WARNING:
                    console.warn(logMessage);
                    break;
                case LOG_LEVEL_INFO:
                    console.info(logMessage);
                    break;
            }
        }
    }

    /**
     * Formats the scorm messages for easy reading
     *
     * @param functionName
     * @param CMIElement
     * @param message
     * @returns {string}
     */
    function formatMessage(functionName, CMIElement, message) {
        var baseLength = 20;
        var messageString = '';

        messageString += functionName;

        var fillChars = baseLength - messageString.length;

        for (var i = 0; i < fillChars; i++) {
            messageString += ' ';
        }

        messageString += ': ';

        if (CMIElement) {
            var CMIElementBaseLength = 70;

            messageString += CMIElement;

            fillChars = CMIElementBaseLength - messageString.length;

            for (var j = 0; j < fillChars; j++) {
                messageString += ' ';
            }
        }

        if (message) {
            messageString += message;
        }

        return messageString;
    }

    /**
     * Converts data structures to JSON
     *
     * @returns {json}
     */
    function jsonFormatter() {
        this.jsonString = true;
        delete this.toJSON;

        var jsonValue = JSON.stringify(this);

        this.toJSON = jsonFormatter;
        this.jsonString = false;

        var returnObject = JSON.parse(jsonValue);

        for (var key in returnObject) {
            if (returnObject.hasOwnProperty(key)) {
                if (key.indexOf('_') === 0) {
                    delete returnObject[key];
                }
            }
        }

        delete returnObject.jsonString;

        return returnObject;
    }

    /**
     * Provides a mechanism for attaching to a specific scorm event
     *
     * @param listenerString
     * @param callback
     */
    function onListener(listenerString, callback) {
        if (!callback) {
            return;
        }

        var listenerSplit = listenerString.split('.');

        if (listenerSplit.length === 0) {
            return;
        }

        var functionName = listenerSplit[0];
        var CMIElement = null;

        if (listenerSplit.length > 1) {
            CMIElement = listenerString.replace(functionName + '.', '');
        }

        this.listenerArray.push(
            {
                functionName: functionName,
                CMIElement: CMIElement,
                callback: callback
            }
        )
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

            if (listener.functionName === functionName) {
                if (listener.CMIElement && listener.CMIElement === CMIElement) {
                    listener.callback(CMIElement, value);
                }
                else {
                    listener.callback(CMIElement, value);
                }
            }
        }
    }

    /**
     * Throws a scorm error
     *
     * @param errorNumber
     * @param message
     */
    function throwSCORMError(errorNumber, message) {
        if (!message) {
            message = getLmsErrorMessageDetails(errorNumber);
        }

        this.apiLog('throwSCORMError', null, errorNumber + ': ' + message, LOG_LEVEL_ERROR);

        this.lastErrorCode = String(errorNumber);
    }
})();
