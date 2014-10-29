//---------------------------------------------------------------------------------
//- user
//---------------------------------------------------------------------------------
var fn = require('../../../lib/fn');
var log = console.log;

exports.User = function() {
  this.name = '?';

  function getLinks() {
    // if ( ! this.isCompleted()) {
    //   return [
    //     { rel: 'save', method: "PUT" },
    //     { rel: 'archive',  method: "DELETE" }
    //   ];
    // }
    // else if (this.archived) {
    //   return [
    //     { rel: 'remove', method: "DELETE" }
    //   ];
    // }
    return [];
  }
};
