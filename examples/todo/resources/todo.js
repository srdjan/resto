//---------------------------------------------------------------------------------
//- todo-app
//---------------------------------------------------------------------------------
var fn = require('../../../lib/fn');
var log = console.log;

exports.Task = function() {
  this.content = '?';
  this.isDone = false;
  this.isArchived = false;

  function save(task) {
    if (task.content.length > 9) return false;
    return true;
  }
  function done(task) {
    if (task.isDone) return true;
    return false;
  }
  function notDone(task) {
    if ( ! task.isDone) return true;
    return false;
  }

  function getLinks() {
    if ( ! this.isDone && ! this.isArchived) {
      return [
        { rel: 'save', method: "PUT" },
        { rel: 'markDone', method: "PUT" },
        { rel: 'archive',  method: "PUT" }
      ];
    }
    else if (this.isDone && ! this.isArchived) {
      return [
        { rel: 'archive', method: "PUT" },
        { rel: 'markNotDone', method: "PUT" }
      ];
    }
    else if (this.isArchived) {
      return [
        { rel: 'remove', method: "DELETE" }
      ];
    }
    return [];
  }
};
