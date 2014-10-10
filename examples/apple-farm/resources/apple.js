var fn  = require('../../../lib/fn');
var log = console.log;

exports.Apple = function() {
  this.weight = 0.1;
  this.color = 'green';

  this.grow = function(msg) {
    if (this.weight > 0.0 && (this.weight + msg.weightIncr) < 300.0) {
      this.weight += msg.weightIncr;
      return true;
    }
    return false;
  };

  this.eat = function(msg) {
    if (msg.weight) return false;
    return true;
  };

  this.toss = function(msg) {
    log('tossed apple: ' + JSON.stringify(this));
    return true;
  };

  this.getLinks = function() {
    if (this.weight > 0.0 && this.weight < 200.0) {
      return [{ rel: 'grow', method: "POST" },
              { rel: 'toss', method: "DELETE"}];
    }
    else if (this.weight >= 200.0 && this.weight < 300.0) {
      return [{ rel: 'eat', method: "PUT" },
              { rel: 'toss', method: "DELETE" }];
    }
    else if ( ! this.weight) {
      return [{ rel: 'toss', method: "DELETE"}];
    }
    return [];
  };

  this.getMeta = function() {
    var properties = [];
    properties.push( {
          name: 'weight',
          type: 'number',
          label: 'Current Weight:',
          readOnly: true
        });
    properties.push( {
          name: 'maxWeight',
          type: 'number',
          label: 'Maximum Weight:',
          readOnly: true
        });
    properties.push( {
          name: 'color',
          type: 'string',
          label: 'Color:',
          readOnly: false,
          validation: {
                        "required": true,
                        "max-length" : 15,
                        "validator" : function(value) {
                          return fn.some(function(item) {
                              return item === value;
                            }), ["green", "orange", "red"]; }
                      }
    });

    return {
      label: 'Apple',
      pageSize: 3,
      properties: props
    };
  };
};

