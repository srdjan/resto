var log = console.log;

exports.Farm = function(name, targetNumberOfApples) {
  this.name = name;
  this.numberOfApples = 0;
  this.targetNumberOfApples = targetNumberOfApples;
  this.numberOfTimesWatered = 0;
  this.numberOfTimesToWater = 4;

  this.seed = function(msg) {
    this.numberOfApples += msg.applesIncr;
    return true;
  };

  this.water = function(msg) {
    this.numberOfTimesWatered++;
    return true;
  };

  this.harvest = function(msg) {
    log('harvested apples: ' + JSON.stringify(this));
    return true;
  };

  this.getLinks = function() {
    if (this.numberOfApples < this.targetNumberOfApples) {
      return [{ rel: 'seed', method: "POST" }];
    }
    else if (this.numberOfTimesWatered < this.numberOFTimesToWater) {
      return [{ rel: 'water', method: "PUT" }];
    }
    else if ( this.numberOfApples >= this.targetNumberOfApples && this.numberOfTimesWatered >= thisNumberOFTimesToWater) {
      return [{ rel: 'harvest', method: "DELETE"}];
    }
    return [];
  };
};

