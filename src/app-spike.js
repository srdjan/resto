'use strict;'
var Resource = require('./fx.js').Resource;
var log = console.log;

function Todo() {
  this.content = '';
  this.done = false;
  this.archived = false;

  //- rels:
  this.save = function(todo) {
    if(tood.content.length <= 256) {
      this.done = false;
      this.archived = false;
      return true;
    }
    return false;
  };
  this.markDone = function(todo) {
    this.done = true;
    return true;
  };
  this.markNotDone = function(todo) {
    this.done = false;
    return true;
  };
  this.archive = function(todo) {
    this.archived = true;
    return true;
  };
  this.reinstate = function(apple) {
    this.archived = false;
    return true;
  };
  this.deleteValid = function(apple) {
    if (this.archived) return true;
    return false;
  };

  //- states:
  this.state_pending = function() {
    if ( ! this.done && ! this.archived) {
      return [
        { rel: 'save', method: "put" },
        { rel: 'markDone', method: "put" },
        { rel: 'archive',  method: "put" }
      ];
    }
    return false;
  };

  this.state_done = function() {
    if (this.done === true) {
      return [
        { rel: 'archive', method: "put" },
        { rel: 'markNotDone', method: "put" }
      ];
    }
    return false;
  };

  this.state_archived = function() {
    if (this.archived === true) {
      return [
      { rel: 'reinstate', method: "put" },
      { rel: 'deleteValid', method: "delete" }
    ];
    }
    return false;
  };
};

module.exports.todoResource = new Resource(Todo);
