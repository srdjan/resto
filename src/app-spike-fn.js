var Either = require('data.either');
var log = console.log;
var Success = Either.Left;
var Continue = Either.Right;

//exports
var Todo = {
  content: '?',
  done:  false,
  archived: false
};

//exports
function save(newTodo) {
  if(newTodo.content.length > 9) {
    return false;
  }
  return true;
}

//exports
function done(newTodo) {
  return true;
}

//exports
function notDone(newTodo) {
  return true;
}

function state_pending(todo) {
  if ( ! todo.done && ! todo.archived) {
    log('state pending:');
    todo.state = [
      { rel: 'save', method: "PUT" },
      { rel: 'markDone', method: "PUT" },
      { rel: 'archive',  method: "PUT" }
    ];
    return Success(todo);
  }
  return Continue(todo);
}

function state_done(todo) {
  if (todo.done && ! todo.archived) {
    log('state done:');
    todo.state = [
      { rel: 'archive', method: "PUT" },
      { rel: 'markNotDone', method: "PUT" }
    ];
    return Success(todo);
  }
  return Continue(todo);
}

function state_archived(todo) {
  if (todo.archived) {
    log('state: archived:');
    todo.state = [
      { rel: 'remove', method: "DELETE" }
    ];
    return Success(todo);
  }
  return Continue(todo);
}

// exports
function getState(newTodo) {
  return Either.of(newTodo)
          .chain(state_pending)
          .chain(state_done)
          .chain(state_archived)
          .merge();
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: app-spike-fn.js');

var res = getState({
  content: 'bla bla bla',
  done:  true,
  archived: false
});
// log(res);
log(res.state);

