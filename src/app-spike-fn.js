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
  if (todo.done) {
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
          .orElse(function(todo) {
            return todo;
          });
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
var expect = require('expect.js');
log('testing: app-spike-fn.js');

var res = getState({
  content: 'bla bla bla',
  done:  true,
  archived: true
});
log(res.state);

