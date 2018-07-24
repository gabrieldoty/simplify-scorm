(function() {
  "use strict";

  describe("jsonFormatter", function() {
    var anyInitialValue = "any initial value";
    var anyModifiedValue = "any modified value";
    var jsonFormatter = window.simplifyScorm.jsonFormatter;
    var dataStructure, json;

    context("when converting a data structure", function() {
      beforeEach(function() {
        dataStructure = {
          _attribute: anyInitialValue,
          get attribute() { return this._attribute; },
          set attribute(attribute) { this._attribute = attribute; },

          functionAttribute: function() {},

          toJSON: jsonFormatter
        };

        json = dataStructure.toJSON();
      });

      it("should convert public attributes", function() {
        expect(json.attribute).to.equal(anyInitialValue);
      });

      it("should not convert private attributes", function() {
        expect(json._attribute).to.be.undefined;
      });

      it("should not convert functions", function() {
        expect(json.functionAttribute).to.be.undefined;
        expect(json.toJSON).to.be.undefined;
      });

      it("should create a copy of the original object", function() {
        json.attribute = anyModifiedValue;
        expect(json.attribute).to.equal(anyModifiedValue);
        expect(dataStructure.attribute).to.equal(anyInitialValue);
      });
    });

    context("when attribute is read-only", function() {
      beforeEach(function() {
        dataStructure = {
          _attribute: anyInitialValue,
          get attribute() { return this._attribute; },
          set attribute(attribute) { /* do nothing */ },

          toJSON: jsonFormatter
        };

        json = dataStructure.toJSON();
      });

      it("should convert it to a read-write JSON object", function() {
        json.attribute = anyModifiedValue;
        expect(json.attribute).to.equal(anyModifiedValue);
      });
    });

    context("when attribute is write-only", function() {
      beforeEach(function() {
        dataStructure = {
          _attribute: anyInitialValue,
          get attribute() { /* do nothing */ },
          set attribute(attribute) { this._attribute = attribute; },

          toJSON: jsonFormatter
        };

        json = dataStructure.toJSON();
      });

      it("should convert it to a read-write JSON object", function() {
        json.attribute = anyModifiedValue;
        expect(json.attribute).to.equal(anyModifiedValue);
      });
    });
  });
})();
