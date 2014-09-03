var log = console.log;

 function createTodo() {
  var content = '';
  var done = false;
  var archived = false;

  return {
    save: function(todo) {
      if(todo.content.length <= 256) {
        done = false;
        archived = false;
        return true;
      }
      return false;
    },
    done: function(todo) {
      done = true;
      return true;
    },
    notDone: function(todo) {
      done = false;
      return true;
    },
    archive: function(todo) {
      archived = true;
      return true;
    },
    state_pending: function() {
      if ( ! done && ! archived) {
        return [
          { rel: 'save', method: "put" },
          { rel: 'markDone', method: "put" },
          { rel: 'archive',  method: "put" }
        ];
      }
      return false;
    },
    state_done: function() {
      if (done === true) {
        return [
          { rel: 'archive', method: "put" },
          { rel: 'markNotDone', method: "put" }
        ];
      }
      return false;
    },
    archived: function() {
      if (archived === true) {
        return [
        { rel: 'reinstate', method: "put" },
        { rel: 'deleteValid', method: "delete" }
      ];
      }
      return false;
    }
  };
}

var todo = createTodo();
log(todo.done());

// module.exports.todoResource = new Resource(Todo);
