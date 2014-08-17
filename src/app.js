//---------------------------------------------------------------------------------
//- application
//---------------------------------------------------------------------------------
'use strict;'
var fx = require('./fx.js');

//--  Apple app APi
//--
function Apple() {
  this.id = fx.id();
  this.weight = 0.1;
  this.color = 'green';

  //- rels:
  this.grow = function(apple) {
    weight = apple.weight;
  };
  this.eat = function(apple) {
    apple.weight < 0.0 ? weight = 0.0 : weight = apple.weight;
  };
  this.toss = function(apple) {
    weight = 0.0;
  };

  //- states:
  this.state_growing = function() {
    if ((this.weight >= 0.1 && this.weight < 200.0) === true) {
      return [{
        rel: 'grow',
        method: "put"
      }, {
        rel: 'toss',
        method: "delete"
      }];
    }
    return false;
  };

  this.state_ready_to_eat = function() {
    if ((this.weight >= 200.0) === true) {
      return [{
        rel: 'eat',
        method: "put"
      }, {
        rel: 'toss',
        method: "delete"
      }];
    }
    return false;
  };

  this.state_done = function() {
    if ((this.weight < 0.1) === true) {
      return [];
    }
    return false;
  };
};
exports.appleResource = new fx.Resource(Apple);

//--  TODO app APi
//--
function Todo() {
  this.id = fx.id();
  this.content = '';
  this.done = false;
  this.archived = false;

  //- rels:
  this.save = function(todo) {
    this.done = false;
    this.archived = false;
  };
  this.markDone = function(todo) {
    this.done = true;
  };
  this.markNotDone = function(todo) {
    this.done = false;
  };
  this.archine = function(todo) {
    this.archived = true;
  };
  this.reinstate = function(apple) {
    this.archived = false;
  };
  this.deleteValid = function(apple) {
    if (this.archived) return true;
    return false;
  };

  //- states:
  this.state_pending = function() {
    if (this.done == false && this.archived === false) {
      return [{
        rel: 'save',
        method: "put"
      }, {
        rel: 'markDone',
        method: "put"
      }, {
        rel: 'archive',
        method: "put"
      }];
    }
    return false;
  };

  this.state_done = function() {
    if (this.done === true) {
      return [{
        rel: 'archive',
        method: "put"
      }, {
        rel: 'markNotDone',
        method: "put"
      }];
    }
    return false;
  };

  this.state_archived = function() {
    if (this.archived === true) {
      return [{
        rel: 'reinstate',
        method: "put"
      }, {
        rel: 'deleteValid',
        method: "delete"
      }];
    }
    return false;
  };
};

exports.todoResource = new fx.Resource(Todo);
