//---------------------------------------------------------------------------------
//- application
//---------------------------------------------------------------------------------
'use strict;'
var fx = require('./fx.js');
var db = require('./db.js');

//--  Apple app APi
//--
function Apple() {
  this.id = db.createId();
  this.weight = 0.1;
  this.color = 'green';

  //- rels:
  this.grow = function(msg) {
    if (this.weight > 0.0 && this.weight < 300.0) {
      this.weight += msg.weightIncr;
      return true;
    }
    fx.log('apple.grow validation failed!');
    return false;
  };
  this.eat = function(msg) {
    if (this.weight >= 200.0 && this.weight <= 300.0) {
      if (this.weight <= msg.weightDecr) {
        this.weight -= msg.weightDecr;
        return true;
      }
    }
    fx.log('apple.eat validation failed!');
    return false;
  };
  this.toss = function(apple) {
    this.weight = 0.0;
    return true;
  };

  //- states:
  this.state_growing = function() {
    if (this.weight > 0.0 && this.weight < 200.0) {
      return [{ rel: 'grow', method: "put" },
              { rel: 'toss', method: "delete"}];
    }
    return false;
  };

  this.state_ready_to_eat = function() {
    if (this.weight >= 200.0 && this.weight < 300.0) {
      return [{ rel: 'eat', method: "put" },
              { rel: 'toss', method: "delete" }];
    }
    return false;
  };

  this.state_done = function() {
    if (this.weight === 0.0) {
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
    if(content.length <= 256) {
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
