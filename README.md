# Simplify Scorm
Simplify Scorm is a Javascript API for SCORM 1.2 and SCORM 2004 Run-Time Implementations.

The purpose of this software is to provide a quick, easy way to implement both a SCORM 1.2 Run-Time API and a SCORM 2004 Run-Time API, and integrate them with your backend API.
SCORM has defined the data model required for this integration here: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/

To use, you must include the scormAPI.js file, or the minified version scormAPI.min.js, on the launching page of your SCORM 1.2 or SCORM 2004 application.

```html
<script type="text/javascript" src="/scormAPI.js"></script>
```

Hopefully this makes your life easier, and lets you get up and running much faster in your SCORM development!

# Table of Contents

- [Simplify Scorm](#simplify-scorm)
- [Table of Contents](#table-of-contents)
- [SCORM 1.2](#scorm-12)
  * [Listeners](#listeners)
  * [Saving Your CMI](#saving-your-cmi)
  * [Initial Values](#initial-values)
  * [Logging](#logging)
  * [Resetting](#resetting)
- [SCORM 2004](#scorm-2004)
  * [Listeners](#listeners-1)
  * [Saving Your CMI](#saving-your-cmi-1)
  * [Initial Values](#initial-values-1)
  * [Logging](#logging-1)
  * [Resetting](#resetting-1)

# SCORM 1.2

Simplify Scorm will create a `window.API` object, required by SCORM 1.2, and will handle all the scorm interactions. Everything will be recorded on the object at `window.API.cmi`.

## Listeners

For convenience, hooks are available for all the SCORM API Signature functions:
`LMSInitialize`,
`LMSFinish`,
`LMSGetValue`,
`LMSSetValue`,
`LMSCommit`,
`LMSGetLastError`,
`LMSGetErrorString`,
`LMSGetDiagnostic`

You can add your hook into these by adding a listener to the `window.API` object:

```javascript
window.API.on("LMSInitialize", function() {
  [...]
});
```

You can also listen for events on specific SCORM CMI elements:

```javascript
window.API.on("LMSSetValue.cmi.core.student_id", function(CMIElement, value) {
  [...]
});
```

## Saving Your CMI

To save the CMI data, you can convert the CMI object to JSON and get a simplified data object to send to your backend API.
You should hook into the `LMSFinish` event to know when to save the finished session CMI data.
You can also hook into the `LMSCommit` event to save the progress along the way.

```javascript
var simplifiedObject = window.API.cmi.toJSON();
```

<details>
  <summary>Example output</summary>

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
</details>

## Initial Values

If you want to initially load data from your backend API, you must do it before launching your SCORM 1.2 player. After the player has initialized, you will not be able to change any read-only values.

You can initialize your variables on the CMI object individually:

```javascript
window.API.cmi.core.student_id = "123";
```

You can also initialize the CMI object in bulk by supplying a JSON object. Note that it can be a partial SCORM 1.2 CMI JSON object:

```javascript
window.API.loadFromJSON(json);
```

<details>
  <summary>Example JSON input</summary>

  ```javascript
  var json = {
    "suspend_data": "viewed=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31|lastviewedslide=31|7#1##,3,3,3,7,3,3,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,11#0#b5e89fbb-7cfb-46f0-a7cb-758165d3fe7e=236~262~2542812732762722742772682802752822882852892872832862962931000~3579~32590001001010101010101010101001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001010010010010010010010010011010010010010010010010010010010010112101021000171000~236a71d398e-4023-4967-88fe-1af18721422d06passed6failed000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000105wrong110000000000000000000000000000000000~3185000000000000000000000000000000000000000000000000000000000000000000000000000000000~283~2191w11~21113101w41689~256~2100723031840~21007230314509062302670~2110723031061120000000000000000000~240~234531618~21601011000100000002814169400,#-1",
    "core": {
      "student_id": "123",
      "student_name": "Bob The Builder"
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
  };
  ```
</details>

## Logging

By default, the API is set to only output errors in the Javascript console. You can change this by setting apiLogLevel to your desired level:

```javascript
window.API.apiLogLevel = 1; // Log everything (Debug)
window.API.apiLogLevel = 2; // Log useful information, warning and errors
window.API.apiLogLevel = 3; // Log warnings and errors
window.API.apiLogLevel = 4; // Log errors only
window.API.apiLogLevel = 5; // No logging
```

## Resetting

There may come a time when you need to reset the SCORM 1.2 API.
This is useful when a SCORM object allows retrying after a failure, and you want to track each attempt in a separate CMI object.
SCORM objects often keep a reference to the original API, which is why we recommend resetting the API instead of creating a new one:

```javascript
window.API.reset();
```

Resetting the API brings it back to its original state, including a brand new, untouched CMI object.

# SCORM 2004

Simplify Scorm will create a `window.API_1484_11` object, required by SCORM 2004, and will handle all the scorm interactions. Everything will be recorded on the object at `window.API_1484_11.cmi`.

It is designed to work with the SCORM 2004 4th Edition specification. However, none of the ADL features have been implemented yet.

## Listeners

For convenience, hooks are available for all the SCORM API Signature functions:
`Initialize`,
`Terminate`,
`GetValue`,
`SetValue`,
`Commit`,
`GetLastError`,
`GetErrorString`,
`GetDiagnostic`

You can add your hook into these by adding a listener to the `window.API_1484_11` object:

```javascript
window.API_1484_11.on("Initialize", function() {
  [...]
});
```

You can also listen for events on specific SCORM CMI elements:

```javascript
window.API_1484_11.on("SetValue.cmi.learner_id ", function(CMIElement, value) {
  [...]
});
```

## Saving Your CMI

To save the CMI data, you can convert the CMI object to JSON and get a simplified data object to send to your backend API.
You should hook into the `Terminate` event to know when to save the finished session CMI data.
You can also hook into the `Commit` event to save the progress along the way.

```javascript
var simplifiedObject = window.API_1484_11.cmi.toJSON();
```

<details>
  <summary>Example output</summary>

  ```json
  {
    "completion_status": "incomplete",
    "completion_threshold": "",
    "credit": "credit",
    "entry": "",
    "exit": "suspend",
    "launch_data": "",
    "learner_id": "",
    "learner_name": "",
    "location": "",
    "max_time_allowed": "",
    "mode": "normal",
    "progress_measure": "",
    "scaled_passing_score": "",
    "session_time": "PT3M30S",
    "success_status": "unknown",
    "suspend_data": "viewed=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31|lastviewedslide=31|7#1##,3,3,3,7,3,3,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,11#0#b5e89fbb-7cfb-46f0-a7cb-758165d3fe7e=236~262~2542812732762722742772682802752822882852892872832862962931000~3579~32590001001010101010101010101001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001010010010010010010010010011010010010010010010010010010010010112101021000171000~236a71d398e-4023-4967-88fe-1af18721422d06passed6failed000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000105wrong110000000000000000000000000000000000~3185000000000000000000000000000000000000000000000000000000000000000000000000000000000~283~2191w11~21113101w41689~256~2100723031840~21007230314509062302670~2110723031061120000000000000000000~240~234531618~21601011000100000002814169400,#-1",
    "time_limit_action": "continue,no message",
    "total_time": "",
    "comments_from_learner": {
      "childArray": [
      ]
    },
    "comments_from_lms": {
      "childArray": [
      ]
    },
    "interactions": {
      "childArray": [
        {
          "id": "Question14_1",
          "type": "choice",
          "timestamp": "2018-08-26T11:05:21",
          "weighting": "1",
          "learner_response": "HTH",
          "result": "wrong",
          "latency": "PT2M30S",
          "description": "",
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
    },
    "learner_preference": {
      "audio_level": "1",
      "language": "",
      "delivery_speed": "1",
      "audio_captioning": "0"
    },
    "objectives": {
      "childArray": [
      ]
    },
    "score": {
      "scaled": "",
      "raw": "",
      "min": "",
      "max": ""
    }
  }
  ```
</details>

## Initial Values

If you want to initially load data from your backend API, you must do it before launching your SCORM 2004 player. After the player has initialized, you will not be able to change any read-only values.

You can initialize your variables on the CMI object individually:

```javascript
window.API_1484_11.cmi.learner_id = "123";
```

You can also initialize the CMI object in bulk by supplying a JSON object. Note that it can be a partial SCORM 2004 CMI JSON object:

```javascript
window.API_1484_11.loadFromJSON(json);
```

<details>
  <summary>Example JSON input</summary>

  ```javascript
  var json = {
    "learner_id": "123",
    "learner_name": "Bob The Builder",
    "suspend_data": "viewed=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31|lastviewedslide=31|7#1##,3,3,3,7,3,3,7,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,11#0#b5e89fbb-7cfb-46f0-a7cb-758165d3fe7e=236~262~2542812732762722742772682802752822882852892872832862962931000~3579~32590001001010101010101010101001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001001010010010010010010010010011010010010010010010010010010010010112101021000171000~236a71d398e-4023-4967-88fe-1af18721422d06passed6failed000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000105wrong110000000000000000000000000000000000~3185000000000000000000000000000000000000000000000000000000000000000000000000000000000~283~2191w11~21113101w41689~256~2100723031840~21007230314509062302670~2110723031061120000000000000000000~240~234531618~21601011000100000002814169400,#-1",
    "interactions": {
      "childArray": [
        {
          "id": "Question14_1",
          "type": "choice",
          "timestamp": "2018-08-26T11:05:21",
          "weighting": "1",
          "learner_response": "HTH",
          "result": "wrong",
          "latency": "PT2M30S",
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
  };
  ```
</details>

## Logging

By default, the API is set to only output errors in the Javascript console. You can change this by setting apiLogLevel to your desired level:

```javascript
window.API_1484_11.apiLogLevel = 1; // Log everything (Debug)
window.API_1484_11.apiLogLevel = 2; // Log useful information, warning and errors
window.API_1484_11.apiLogLevel = 3; // Log warnings and errors
window.API_1484_11.apiLogLevel = 4; // Log errors only
window.API_1484_11.apiLogLevel = 5; // No logging
```

## Resetting

There may come a time when you need to reset the SCORM 2004 API.
This is useful when a SCORM object allows retrying after a failure, and you want to track each attempt in a separate CMI object.
SCORM objects often keep a reference to the original API, which is why we recommend resetting the API instead of creating a new one:

```javascript
window.API_1484_11.reset();
```

Resetting the API brings it back to its original state, including a brand new, untouched CMI object.
