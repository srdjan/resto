//---------------------------------------------------------------------------------
//- todo-app
//---------------------------------------------------------------------------------
var fn  = require('../../../lib/fn');
var t   = require('tcomb');
var log = console.log;

var Task = t.struct({
  content: t.Str,
  isDone: t.Bool,
  isArchived: t.Bool
});

Task.prototype.save = function(task) {
  if (task.content.length > 9) return false;
  return true;
};

Task.prototype.done = function(task) {
  if (task.isDone) return true;
  return false;
};

Task.prototype.notDone = function(task) {
  if ( ! task.isDone) return true;
  return false;
};

Task.prototype.getLinks = function() {
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
};

exports.Task = Task;
