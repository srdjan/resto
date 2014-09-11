//---------------------------------------------------------------------------------
//- todo-app
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var log = console.log;

//note: parent-child relationships
//one, oneOrMore, zeroOrOne, zeroOrMore
//

exports.Activity = function() {
  this.name = '?';
  this.taskList = { zeroOrMore : [] };
  this.archived = false;

//-- helper methods
  this.isCompleted = function() {
    return fn.every(function(t) {return t.isDone;}, this.taskList);
  };

//-- api
  function save(activity) {
    if (activity.taskList.length === 0) return false;
    return true;
  }
  function archive(activity) {
    if (activity.isCompleted()) {
      activity.archived = true;
    }
    return false;
  }

  function getLinks() {
    if ( ! this.isCompleted()) {
      return [
        { rel: 'save', method: "PUT" },
        { rel: 'archive',  method: "DELETE" }
      ];
    }
    else if (this.archived) {
      return [
        { rel: 'remove', method: "DELETE" }
      ];
    }
    return [];
  }
};

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
