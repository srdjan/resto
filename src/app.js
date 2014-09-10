var log = console.log;

exports.Apple = function() {
  this.weight = 0.1;
  this.color = 'green';

  this.grow = function(msg) {
    if (this.weight > 0.0 && this.weight < 300.0) {
      this.weight += msg.weightIncr;
      return true;
    }
    return false;
  };

  this.eat = function(msg) {
    if (msg.weight === 0.0) {
      return true;
    }
    return false;
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
    else if (this.weight === 0.0) {
      return [{ rel: 'toss', method: "DELETE"}];
    }
    return [];
  };
};
