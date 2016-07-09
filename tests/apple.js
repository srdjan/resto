const log = console.log

exports.Apple = function() {
  this.weight = 1
  this.color = 'green'

  this.grow = function(msg) {
    if (this.weight > 0 && (this.weight + msg.weightIncr) < 300) {
      this.weight += msg.weightIncr
      return true
    }
    return false
  }

  this.eat = function(msg) {
    if (msg.weight) return false
    return true
  }

  this.toss = function(msg) {
    log('tossed apple: ' + JSON.stringify(this))
    return true
  }

  this.getLinks = function() {
    if (this.weight > 0 && this.weight < 200) {
      return [{ rel: 'grow', method: "POST" },
              { rel: 'toss', method: "DELETE"}]
    }
    else if (this.weight >= 200 && this.weight < 300) {
      return [{ rel: 'eat', method: "PUT" },
              { rel: 'toss', method: "DELETE" }]
    }
    else if ( ! this.weight) {
      return [{ rel: 'toss', method: "DELETE"}]
    }
    return []
  }
}
