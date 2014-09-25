// //---------------------------------------------------------------------------------
// //- service
// //---------------------------------------------------------------------------------
// var fn  = require('./fn');
// var log = console.log;

// exports.create = function(agroot) {
//   var root = agroot;
//   var realtionships = [];

//   return {
//     model: { root:root, realtionships:realtionships },

//     hasMany: function(resource) {
//       realtionships.push({one:root, toMany:resource});
//       return this;
//     },

//     hasOne: function(resource) {
//       realtionships.push({one:root, toOne:resource});
//       return this;
//     }
//   };
// };
// //---------------------------------------------------------------------------------
// //@tests
// //---------------------------------------------------------------------------------
//   var expect = require('expect.js');
//   log('testing: service.js');

//   var farm      = require('../examples/apple-farm/resources/farm');
//   var apples    = require('../examples/apple-farm//resources/apple');
//   var appleFarm = exports.create(farm)
//                        .hasMany(apples);
