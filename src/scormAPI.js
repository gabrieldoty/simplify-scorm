window.API = new API();

function API() {
    var _self = this;

    var SCORM_TRUE = 'true';
    var SCORM_FALSE = 'false';

    var STATE_NOT_INITIALIZED = 0;
    var STATE_INITIALIZED = 1;
    var STATE_COMPLETE = 2;

    var LOG_LEVEL_DEBUG = 1;
    var LOG_LEVEL_INFO = 2;
    var LOG_LEVEL_WARNING = 3;
    var LOG_LEVEL_ERROR = 4;

    _self.cmi = new CMI(_self);
    _self.lastErrorCode = null;
    _self.currentState = STATE_NOT_INITIALIZED;

    _self.LMSInitialize = LMSInitialize;
    _self.LMSFinish = LMSFinish;
    _self.LMSGetValue = LMSGetValue;
    _self.LMSSetValue = LMSSetValue;
    _self.LMSCommit = LMSCommit;
    _self.LMSGetLastError = LMSGetLastError;
    _self.LMSGetErrorString = LMSGetErrorString;
    _self.LMSGetDiagnostic = LMSGetDiagnostic;

    //Diagnostic functions

    _self.apiLogLevel = LOG_LEVEL_DEBUG;
    _self.apiLog = apiLog;
    _self.on = onListener;
    _self.listenerArray = [];
    _self.throwSCORMError = throwSCORMError;

    /**
     * @returns {string} bool
     */
    function LMSInitialize() {
        var return_value = SCORM_FALSE;

        if (_self.currentState === STATE_INITIALIZED) {
            throwSCORMError(_self, 101, 'LMS was already initialized!');
        }
        else {
            _self.currentState = STATE_INITIALIZED;
            return_value = SCORM_TRUE;
        }

        processListeners('LMSInitialize');

        _self.apiLog('LMSInitialize', null, 'returned: ' + return_value, LOG_LEVEL_INFO);

        return return_value;
    }

    /**
     * @returns {string} bool
     */
    function LMSFinish() {
        checkState();

        _self.apiLog('LMSFinish', '', null, LOG_LEVEL_INFO);

        processListeners('LMSFinish');

        return SCORM_TRUE;
    }

    /**
     * @param CMIElement
     * @returns {string}
     */
    function LMSGetValue(CMIElement) {
        checkState();

        var elementValue = getCMIValue(CMIElement);

        _self.apiLog('LMSGetValue', CMIElement, ': returned: ' + elementValue, LOG_LEVEL_INFO);

        processListeners('LMSGetValue', CMIElement);

        return elementValue;
    }

    /**
     * @param CMIElement
     * @param value
     * @returns {string}
     */
    function LMSSetValue(CMIElement, value) {
        checkState();

        var setResult = setCMIValue(CMIElement, value);

        _self.apiLog('LMSSetValue', CMIElement, ': ' + value + ': result: ' + setResult, LOG_LEVEL_INFO);

        processListeners('LMSSetValue', CMIElement, value);

        return setResult;
    }

    /**
     * Orders LMS to store all content parameters
     */
    function LMSCommit() {
        checkState();

        processListeners('LMSCommit');

        _self.apiLog('LMSCommit', '', null, LOG_LEVEL_INFO);
    }

    /**
     * Returns last error code
     *
     * @returns {string|null}
     */
    function LMSGetLastError() {
        checkState();

        if (_self.lastErrorCode !== null) {
            _self.apiLog('LMSGetLastError', null, 'returned: ' + _self.lastErrorCode, LOG_LEVEL_INFO);
        }

        processListeners('LMSGetLastError');

        return _self.lastErrorCode;
    }

    /**
     * Returns the errorNumber error description
     *
     * @param CMIErrorCode
     * @returns {string}
     */
    function LMSGetErrorString(CMIErrorCode) {
        checkState();

        if (CMIErrorCode !== null && CMIErrorCode !== '') {
            var errorString = getLmsErrorMessageDetails(CMIErrorCode);

            _self.apiLog('LMSGetErrorString', null, 'returned: ' + errorString, LOG_LEVEL_INFO);

            return errorString;
        }

        processListeners('LMSGetErrorString');

        return '';
    }

    /**
     * Returns an comprehensive description of the errorNumber error.
     *
     * @param CMIErrorCode
     * @returns {string}
     */
    function LMSGetDiagnostic(CMIErrorCode) {
        checkState();

        if (CMIErrorCode !== null && CMIErrorCode !== '') {
            var errorString = getLmsErrorMessageDetails(CMIErrorCode, true);

            _self.apiLog('LMSGetDiagnostic', null, 'returned: ' + _self.lastErrorCode, LOG_LEVEL_INFO);

            return errorString;
        }

        processListeners('LMSGetDiagnostic');

        return '';
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

        if (messageLevel >= _self.apiLogLevel) {
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

        _self.listenerArray.push(
            {
                functionName: functionName,
                CMIElement: CMIElement,
                callback: callback
            }
        )
    }

    /**
     * Processes any "on" listeners that have been created
     *
     * @param functionName
     * @param CMIElement
     * @param value
     */
    function processListeners(functionName, CMIElement, value) {
        for (var i = 0; i < _self.listenerArray.length; i++) {
            var listener = _self.listenerArray[i];

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
     * @param API
     * @param errorNumber
     * @param message
     */
    function throwSCORMError(API, errorNumber, message) {
        if (!message) {
            message = getLmsErrorMessageDetails(errorNumber);
        }

        _self.apiLog('throwSCORMError', null, errorNumber + ': ' + message, LOG_LEVEL_ERROR);

        API.lastErrorCode = String(errorNumber);
    }

    /**
     * Checks the LMS state and ensures it has been initialized
     */
    function checkState() {
        if (_self.currentState !== STATE_INITIALIZED) {
            throwSCORMError(_self, 301);
        }
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
                    throwSCORMError(_self, 101, 'setCMIValue did not find an element for: ' + CMIElement);
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

                    //SCO is trying to set an item on an array
                    if (!isNaN(index)) {
                        var item = refObject.childArray[index];

                        if (item) {
                            refObject = item;
                        }
                        else {
                            var newChild;

                            if (CMIElement.indexOf('cmi.objectives') > -1) {
                                newChild = new ObjectivesObject(_self);
                            }
                            else if (CMIElement.indexOf('.correct_responses') > -1) {
                                newChild = new InteractionsCorrectResponsesObject(_self);
                            }
                            else if (CMIElement.indexOf('.objectives') > -1) {
                                newChild = new InteractionsObjectivesObject(_self);
                            }
                            else if (CMIElement.indexOf('cmi.interactions') > -1) {
                                newChild = new InteractionsObject(_self);
                            }

                            if (!newChild) {
                                throwSCORMError(_self, 101, 'Cannot create new sub entity: ' + CMIElement);
                            }
                            else {
                                refObject.childArray.push(newChild);

                                refObject = newChild;
                            }
                        }

                        //Have to update i value to skip the array position
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
                    throwSCORMError(_self, 101, 'getCMIValue did not find a value for: ' + CMIElement);
                }
            }

            refObject = refObject[structure[i]];
        }

        if (refObject === null || refObject === undefined) {
            if (lastProperty === '_children') {
                throwSCORMError(_self, 202);
            }
            else if (lastProperty === '_count') {
                throwSCORMError(_self, 203);
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

        //Set error number to string since inconsistent from modules if string or number
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
 * Cmi data model
 *
 * based on the Scorm CMI 1.2 definition at http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/
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
            API.throwSCORMError(API, 403);
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
            API.throwSCORMError(API, 403);
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
                API.throwSCORMError(API, 402);
            },

            get student_id() {
                return this._student_id;
            },
            set student_id(student_id) {
                API.throwSCORMError(API, 403);
            },
            get student_name() {
                return this._student_name;
            },
            set student_name(student_name) {
                API.throwSCORMError(API, 403);
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
                API.throwSCORMError(API, 403);
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
                API.throwSCORMError(API, 403);
            },
            get total_time() {
                return this._total_time;
            },
            set total_time(total_time) {
                API.throwSCORMError(API, 403);
            },
            get lesson_mode() {
                return this._lesson_mode;
            },
            set lesson_mode(lesson_mode) {
                API.throwSCORMError(API, 403);
            },
            get exit() {
                if (!this.jsonString) {
                    API.throwSCORMError(API, 404);
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
                    API.throwSCORMError(API, 404);
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
                    API.throwSCORMError(API, 402);
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
                API.throwSCORMError(API, 402);
            },
            get _count() {
                return this.childArray.length;
            },
            set _count(count) {
                API.throwSCORMError(API, 402);
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
                API.throwSCORMError(API, 402);
            },
            get mastery_score() {
                return this._mastery_score;
            },
            set mastery_score(mastery_score) {
                API.throwSCORMError(API, 403);
            },
            get max_time_allowed() {
                return this._max_time_allowed;
            },
            set max_time_allowed(max_time_allowed) {
                API.throwSCORMError(API, 403);
            },
            get time_limit_action() {
                return this._time_limit_action;
            },
            set time_limit_action(time_limit_action) {
                API.throwSCORMError(API, 403);
            },
            toJSON: jsonFormatter
        },
        student_preference: {
            __children: 'language,speech,audio,speed,text',
            get _children() {
                return this.__children;
            },
            set _children(_children) {
                API.throwSCORMError(API, 402);
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
                API.throwSCORMError(API, 402);
            },
            get _count() {
                return this.childArray.length;
            },
            set _count(_count) {
                API.throwSCORMError(API, 402);
            },
            toJSON: jsonFormatter
        },
        toJSON: jsonFormatter
    };
}

function InteractionsObject(API) {
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 404);
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
                API.throwSCORMError(API, 402);
            },
            toJSON: jsonFormatter
        },
        correct_responses: {
            childArray: [],

            get _count() {
                return this.childArray.length;
            },
            set _count(_count) {
                API.throwSCORMError(API, 402);
            },
            toJSON: jsonFormatter
        },
        toJSON: jsonFormatter
    }
}

function ObjectivesObject(API) {
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
                API.throwSCORMError(API, 402);
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

function InteractionsObjectivesObject(API) {
    return {
        jsonString: false,
        _id: '',

        get id() {
            if (!this.jsonString) {
                API.throwSCORMError(API, 404);
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

function InteractionsCorrectResponsesObject(API) {
    return {
        jsonString: false,
        _pattern: '',

        get pattern() {
            if (!this.jsonString) {
                API.throwSCORMError(API, 404);
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