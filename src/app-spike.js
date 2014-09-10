var log = console.log;

var Todo = {
  content: '',
  done: false,
  archived: false
};

function save(todo) {
  if (todo.content.length <= 256) {
    todo.done = todo.archived = false;
    return true;
  }
  return false;
}

function done(todo) {
  if ( ! todo.done) return false;
  return true;
}

function notDone(todo) {
  if (todo.done) return false;
  return true;
}

function archive(todo) {
  if ( ! todo.archived) return false;
  return true;
}

function getState(todo) {
  if ( ! todo.done && ! todo.archived) {
    todo.state = {
        name: 'pending',
        links: [
                { rel: 'save', method: "PUT" },
                { rel: 'done', method: "PUT" }
               ]
            };
    return todo;
  }
  if (todo.done) {
    todo.state = {
        name: 'done',
        links: [
                { rel: 'notDone', method: "PUT" },
                { rel: 'archive', method: "PUT" }
               ]
            };
    return todo;
  }
  if (todo.archived) {
    todo.state = {
        name: 'archived',
        links: [
                { rel: 'remove', method: "DELETE" }
               ]
            };
    return todo;
  }
  return new Error('invalid states');
}

log(done(Todo));
log(getState(Todo));

module.exports = {
  Todo: Todo,
  save: save,
  done: done,
  notDone: notDone,
  archive: archive,
  getState: getState
};
