(function() {
  window.simplifyScorm.jsonFormatter = jsonFormatter;

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
        if (key.indexOf("_") === 0) {
          delete returnObject[key];
        }
      }
    }

    delete returnObject.jsonString;

    return returnObject;
  }
})();
