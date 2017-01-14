# Simplify Scorm
Scorm 1.2 Javascript API

This is a Javascript API for SCORM 1.2 Run-Time Implementations.

The purpose of this software is to provide a quick, easy way to implement a SCORM 1.2 API (Run-Time) and integrate it with your backend API.
SCORM 1.2 has defined the data model required for this integration here: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/

To use, you must include the scormAPI.js file on the launching page of your SCORM 1.2 application

```html
<script type="text/javascript" src="/scormAPI.js"></script>
```

This will create a SCORM API object on the window (required by SCORM 1.2) and thats it!! 

No Really

This will handle all the scorm interactions, and record everything on the object at 

```javascript
window.API.cmi
```

# Listeners

For convenience, I have also added hooks into all the SCORM API Signature functions:

LMSInitialize
LMSFinish
LMSGetValue
LMSSetValue
LMSCommit
LMSGetLastError
LMSGetErrorString
LMSGetDiagnostic

You can add your hook into these by adding a listener to the window.API object:

```javascript
window.API.on('LMSInitialize', function() {
});
```

You can all specify specific SCORM CMI events to listen to:

```javascript
window.API.on('LMSSetValue.cmi.core.student_id', function(CMIElement, value) {
});
```

# Saving Your CMI
Obviously, you will need to tie into the close, or complete event, or otherwise monitor your SCORM player to finalize the session, at that time, you can perform a JSON.stringify on the CMI object to retrieve a simplified data form for sending to your backend API,

```javascript
  var simplifiedObject = JSON.parse(JSON.stringify(window.API.cmi));
```

Example Output: 
```json
{
  "suspend_data": "viewed=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31|lastviewedslide=31|7#1##,3,3,3,7,3,3,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,11#0#b5e89fbb-7cfb-46f0-a7cb-758165d3fe7e=236~262~2542812732762722742772682802752822882852892872832862962931000~3579~32590001001010101010101010101001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001010010010010010010010010011010010010010010010010010010010010112101021000171000~236a71d398e-4023-4967-88fe-1af18721422d06passed6failed000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000105wrong110000000000000000000000000000000000~3185000000000000000000000000000000000000000000000000000000000000000000000000000000000~283~2191w11~21113101w41689~256~2100723031840~21007230314509062302670~2110723031061120000000000000000000~240~234531618~21601011000100000002814169400,#-1",
  "launch_data": "",
  "comments": "",
  "comments_from_lms": "",
  "core": {
    "student_id": "",
    "student_name": "",
    "lesson_location": "",
    "credit": "",
    "lesson_status": "incomplete",
    "total_time": "",
    "lesson_mode": "normal",
    "exit": "suspend",
    "session_time": "0000:00:33.90",
    "score": {
      "raw": "",
      "max": "100",
      "min": ""
    }
  },
  "objectives": {
    "childArray": [
      
    ]
  },
  "student_data": {
    "mastery_score": "",
    "max_time_allowed": "",
    "time_limit_action": ""
  },
  "student_preference": {
    "audio": "",
    "language": "",
    "speed": "",
    "text": ""
  },
  "interactions": {
    "childArray": [
      {
        "id": "Question14_1",
        "time": "11:05:21",
        "type": "choice",
        "weighting": "1",
        "student_response": "HTH",
        "result": "wrong",
        "latency": "0000:00:01.68",
        "objectives": {
          "childArray": [
            {
              "id": "Question14_1"
            }
          ]
        },
        "correct_responses": {
          "childArray": [
            {
              "pattern": "CPR"
            }
          ]
        }
      }
    ]
  }
}
```

# Initial Values
Lastly, if you are doing an initiail load of your data from the backend API, you will need to initialize your variables on the CMI object before launching your SCORM 1.2 player:

<code>
  window.API.cmi.core.student_id = '123';
</code>

# Logging
By default, the API is set to output all interactions in the Javascript console, if you want to change this level, you can change it by setting the the apiLogLevel:

<code>
  window.API.apiLogLevel = 4 //Error only
</code>

Hopefully this makes your life easier, and lets you get up and running much faster in your SCORM developing!!!

