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

    delete this.jsonString;
    this.toJSON = jsonFormatter;

    var returnObject = JSON.parse(jsonValue);
    delete returnObject.jsonString;

    for (var key in returnObject) {
      if (returnObject.hasOwnProperty(key) && key.indexOf("_") === 0) {
        delete returnObject[key];
      }
    }

    return returnObject;
  }
})();
