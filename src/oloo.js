var Todo = {
  base: function(content) {
    this.content = content;
    return this;
  },
  done: function() {
    this.done = true;
  },
  notDone: function() {
    this.done = false;
  }
};

var TodoWithUser = Object.create(Todo);

TodoWithUser.SetUser = function(user) {
  this.user = user;
};


//------------------- Douglas Crackford

function Todo(spec) {
  let { member } = spec, //destructuring
      { other } = baseCtor(spec),
      method = function() {
          // member, other, methid, spec
      };

  return Object.freeze({
      method,
      other
  });
}
