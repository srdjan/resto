var Either = require('data.either');
var Failure = Either.Left;
var Success = Either.Right;
var log = console.log;

//exports
var Todo = {
  content: '?',
  done:  false,
  archived: false
};

//exports
function save(newTodo) {
  if(newTodo.content.length > 9) {
    return Failure("Failed validation");
  }
  return Success({
    content: newTodo.Content,
    done:  false,
    archived: false
  });
}

//exports
function done(newTodo) {
  return Success({
    content: newTodo.content,
    done:  true,
    archived: false
  });
}

//exports
function notDone(newTodo) {
  return Success({
    content: newTodo.content,
    done:  false,
    archived: false
  });
}

function state_pending(todo) {
  if ( ! todo.done && ! todo.archived) {
    return Success([
      { rel: 'save', method: "put" },
      { rel: 'markDone', method: "put" },
      { rel: 'archive',  method: "put" }
    ]);
  }
  return Failure();
}

function state_done(todo) {
  if (todo.done === true) {
    return Success([
      { rel: 'archive', method: "put" },
      { rel: 'markNotDone', method: "put" }
    ]);
  }
  return Failure();
}

function state_archived(todo) {
  if (todo.archived === true) {
    return Success([
      { rel: 'reinstate', method: "put" },
      { rel: 'deleteValid', method: "delete" }
    ]);
  }
  return Failure();
}
//fn
function map(monad, transformation) {
  return monad.chain(function(value) {
    return monad.of(transformation(value));
  });
}
//exports
function getState(todo) {
  return map(state_archived(todo), state_done)
  // .chain(state_archived)
  // .orElse(function(error) {
  //   log('Errorgetting state: ' + error);
  // });
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: app-spike-fn.js');

// var res = done(Todo);
// log(res);
// log(res.get());

var res = getState(Todo);
log(res);

// res = save({content: "1234567890", done: true, archived: false}).orElse(log);
// log(res);

