# Simplify Scorm
Scorm 1.2 Javascript API

This is a Javascript API for SCORM 1.2 Run-Time Implementations.

The purpose of this software is to provide a quick, easy way to implement a SCORM 1.2 API (Run-Time) and integrate it with your backend API.
SCORM 1.2 has defined the data model required for this integration here: http://scorm.com/scorm-explained/technical-scorm/run-time/run-time-reference/

To use, you must include the scormAPI.js file on the launching page of your SCORM 1.2 application

<script type="text/javascript" src="/scormAPI.js"></script>

This will create a SCORM API object on the window (required by SCORM 1.2) and thats it!! 

No Really

This will handle all the scorm interactions, and record everything on the object at 

window.API.cmi

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

<code>
window.API.on('LMSInitialize', function() {
});
</code>

You can all specify specific SCORM CMI events to listen to:

<code>
window.API.on('LMSSetValue.cmi.core.student_id', function(CMIElement, value) {
});
</code>

Obviously, you will need to tie into the close, or complete event, or otherwise monitor your SCORM player to finalize the session, at that time, you can perform a JSON.stringify on the CMI object to retrieve a simplified data form for sending to your backend API,

<code>
  var simplifiedObject = JSON.parse(JSON.stringify(window.API.cmi));
</code>

Lastly, if you are doing an initiail load of your data from the backend API, you will need to initialize your variables on the CMI object before launching your SCORM 1.2 player:

<code>
  window.API.cmi.core.student_id = '123';
</code>

Hopefully this makes your life easier, and lets you get up and running much faster in your SCORM developing!!!

