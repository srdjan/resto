var log = console.log;

function Apple() {
  var weight = 0.1;
  var color = 'green';

  function grow(msg) {
    if (weight > 0.0 && weight < 300.0) {
      weight += msg.weightIncr;
      return true;
    }
    return false;
  }
  function eat(msg) {
    if (msg.weight === 0.0) {
      return true;
    }
    return false;
  }
  function toss(msg) {
    log('tossed apple: ' + JSON.stringify(msg));
    return true;
  }

  function getLinks() {
    if (weight > 0.0 && weight < 200.0) {
      return [{ rel: 'grow', method: "POST" },
              { rel: 'toss', method: "DELETE"}];
    }
    else if (weight >= 200.0 && weight < 300.0) {
      return [{ rel: 'eat', method: "PUT" },
              { rel: 'toss', method: "DELETE" }];
    }
    else if (weight === 0.0) {
      return [{ rel: 'toss', method: "DELETE"}];
    }
    return [];
  }

  return {
    weight: weight,
    color: color,
    grow: grow,
    eat: eat,
    toss: toss,
    getLinks: getLinks
  };
}
module.exports.Apple = Apple;

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var apple = Apple();
log(apple.weight);
log(apple.getLinks());
