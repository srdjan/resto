//---------------------------------------------------------------------------------
//- activity
//---------------------------------------------------------------------------------
var fn = require('../../../lib/fn');
var log = console.log;

exports.Activity = function() {
  this.name = '?';
  this.taskList = [];
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
