'use strict;'
// var Resource = require('./fx.js').Resource;
var stampit = require('stampit');
var log = console.log;
var New = stampit().enclose;

var _todo = New(function () {
  var content = '';
  var done = false;
  var archived = false;
});

var _api = New(function () {
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
});

var _states = New(function () {
  this.pending = function() {
    if ( ! this.done && ! this.archived) {
      return [
        { rel: 'save', method: "put" },
        { rel: 'markDone', method: "put" },
        { rel: 'archive',  method: "put" }
      ];
    }
    return false;
  };

  this.done = function() {
    if (this.done === true) {
      return [
        { rel: 'archive', method: "put" },
        { rel: 'markNotDone', method: "put" }
      ];
    }
    return false;
  };

  this.archived = function() {
    if (this.archived === true) {
      return [
      { rel: 'reinstate', method: "put" },
      { rel: 'deleteValid', method: "delete" }
    ];
    }
    return false;
  };
});

var todo = stampit.compose(_todo, _api, _states);
log(todo.done());

// module.exports.todoResource = new Resource(Todo);
