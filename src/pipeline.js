//---------------------------------------------------------------------------------
//- pipeline
//---------------------------------------------------------------------------------
var fn = require('./fn.js');
var Either = require('data.either');
var log = console.log;

var handlers = [];

function trace(func, ctx) {
  log(fn.getFnName(func) + ', ' + JSON.stringify(ctx) + '\r\n');
}

function writeToResp(response, ctx) {
  response.writeHead(ctx.statusCode, {"Content-Type": "application/json"});
  response.write(ctx.result);
  response.end();
}

function getId(tokens) {
  var id = fn.btoa(tokens[tokens.length - 1]);
  if (isNaN(id)) {
    return { id: 0, rel: ''};
  }
  return { id: id, rel: ''};
}

function getIdAndRel(url) {
  var tokens = fn.getTokens(url);
  if(tokens.length === 2) {
    return {id: 0, rel: ''};
  }
  var idAndRel = getId(tokens);
  if(idAndRel.id !== 0) {
    return idAndRel;
  }
  tokens = fn.btoa(tokens[tokens.length - 1]).split('/');
  if (tokens.length === 2) {
    idAndRel.id = tokens[0];
    idAndRel.rel = tokens[1];
  }
  else {
    idAndRel.rel = tokens[0];
  }
  return idAndRel;
}

// ctx -> (ctx -> ctx)
function run(ctx) {
  var _run = Either.of(ctx);
  handlers.forEach(function(handler) { _run = fn.mapM(_run, handler.func); });
  return _run;
}

exports.use = function(f, p, t) {
  handlers.push({ func: f, pred: p || false, trace: t || false});
};

exports.run = function(request, response) {
  try {
    var idAndRel = getIdAndRel(request.url);
    var ctx = {};
    ctx.id = idAndRel.id;
    ctx.rel = idAndRel.rel;
    ctx.method = request.method.toLowerCase();
    ctx.url = request.url;
    ctx.body = request.body;
    ctx.statusCode = 200;
    var result = run(ctx).orElse(function(err) {return err;});
    // log(result.get())
    writeToResp(response, result.get());
  }
  catch (e) {
    if ( ! e.hasOwnProperty('statusCode')) {
      e.statusCode = 500;
    }
    log('Fx Exception, statusCode: ' + e.statusCode + ' message: ' + e.message);
    writeToResp(response, e.statusCode, e.message);
  }
};

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
  var expect = require('expect.js');
  log('testing: pipeline.js');

  //test: getTokens(url):- api/apples/
  var url = '/api/apples/';
  var tokens = fn.getTokens(url);
  expect(tokens.length).to.be(2);

  //test: getId(tokens):- api/apples
  var idAndRel = getId(tokens);
  expect(idAndRel.id).to.be(0);

  //test: getTokens(url):- api/apples/123456
  url = 'api/apples/' + fn.atob('123456');
  tokens = fn.getTokens(url);
  expect(tokens.length).to.be(3);

  //test: getId(tokens):- api/apples || api/apples/abc3b4=1
  idAndRel = getId(tokens);
  expect(idAndRel.id).to.be('123456');

  //test: getIdAndRel(url):- api/apples/
  url = 'api/apples/';
  idAndRel = getIdAndRel(url);
  expect(idAndRel.id).to.be(0);
  expect(idAndRel.rel).to.be('');

  //test: getTokens(url):- api/apples/123456
  url = 'api/apples/' + fn.atob('123456');
  idAndRel = getIdAndRel(url);
  expect(idAndRel.id).to.be('123456');
  expect(idAndRel.rel).to.be('');

  //test: getIdAndRel(url):- api/apples/123456/create
  url = 'api/apples/' + fn.atob(123456 + '/' + 'create');
  idAndRel = getIdAndRel(url);
  expect(idAndRel.id).to.be('123456');
  expect(idAndRel.rel).to.be('create');
