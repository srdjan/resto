var service       = require('../../src/service');
var pipeline      = require('../../src/pipeline');
var http          = require('../../src/server');
var authenticator = require('../../src/authn');
var authorizer    = require('../../src/authr');
var resolver      = require('../../src/resolver');
var invoker       = require('../../src/invoker');
var converter     = require('../../src/hal');
var domain        = require('../../src/domain');

var farm          = require('./resources/farm');
var apples        = require('./resources/apple');

var appDomain = domain.root(farm)
                      .addRelationship(hasMany(apple))
                      .addSubRelationship(hasOne(harvester));

//use:
//http://jnuno.com/tree-model-js/
// or
// http://gcanti.github.io/tcomb/
function Domain(root) {
  var tree = new TreeModel();
  var root = tree.parse({root});
  var currentNode = root;
  this.add(node) {
    currentNode.addChild(node);
  }
}

appDomain = new Domain(farm);
appDomain.add(apple);
// ({
//     type: farm,
//     children: [
//         {
//             type: apple,
//             children: [{type: harvester}]
//         },
//         {
//             type: pear,
//         },
//         {
//             type: owner
//         }
//     ]
// });
//

var Product = struct({
    name: Str,                  // required string
    desc: maybe(Str),           // optional string, can be null
    home: Url,                  // a subtype of a string
    shippings: list(Str),       // a list of shipping methods
    category: Category,         // enum, one of [audio, video]
    price: union([Num, Price]), // a price (dollars) OR in another currency
    size: tuple([Num, Num]),    // width x height
    warranty: dict(Num)         // a dictionary country -> covered years
});

var ReqResp = pipeline.expose(appDomain)
                      .use(authenticator)
                      .use(resolver)
                      .use(authorizer)
                      .use(invoker)
                      .use(converter);
 var EndPoint = http.create(ReqResp);
EndPoint.start(8080);

//var endPoints = [].push(http.create(8080)
//                  .push(ws.create(7676)));
