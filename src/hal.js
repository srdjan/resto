//---------------------------------------------------------------------------------
//- hal parsing
//---------------------------------------------------------------------------------
"use strict"

const halson = require('halson')
const fn = require('./core/fn')
const log = console.log

//--------
function isFunc(obj) {
  return obj instanceof Function
}

function isNotFunc(obj) {
  return !isFunc(obj)
}

function isObject(obj) {
  return obj instanceof Object
}

function isNotObject(obj) {
  return !isObject(obj)
}

function isEmbed(prop) {
  return isObject(prop) && prop.hasOwnProperty('id')
}

function isNotEmbed(prop) {
  return !isEmbed(prop)
}

function isNotId(propName) {
    return propName !== 'id'
}
  //--------

function addProperties(halRep, result) {
  // fn.trace(result)
  let propNames = fn.filter(propName => isNotId(propName) &&
                                        isNotEmbed(result[propName]) &&
                                        isNotFunc(result[propName]),
                                        Object.keys(result))
  return fn.map(propName => halRep[propName] = result[propName], propNames)
}

function addEmbed(halRep, typeName, result) {
  let embed = halson({}).addLink('self', '/api/' + typeName + '/' + fn.atob(result.id))
  addProperties(embed, result)
  halRep.addEmbed(typeName, embed)
}

function addEmbeds(halRep, typeName, result) {
  let propNames = fn.filter(propName => isNotFunc(result[propName]) &&
                                        isEmbed(result[propName]),
                                        Object.keys(result))
  return propNames.forEach(propName => addEmbed(halRep, propName, result[propName]))
}

function addLinks(halRep, typeName, result) {
  halRep.addLink('self', '/api/' + typeName + 's/' + fn.atob(result.id))

  let links = result.getLinks()
  links.forEach(l => {
    halRep.addLink(l.rel, {
      href: '/api/' + typeName + 's/' + fn.atob(result.id + '/' + l.rel),
      method: l.method
    })
  })
  return halRep
}

function createListRoot(halRep, typeName) {
  halRep.addLink('self', '/api/' + typeName + 's')
  halRep.addLink('create', {
    href: '/api/' + typeName + 's/' + fn.atob('create'),
    method: 'POST'
  })
  return halRep
}

function createPagedListRoot(halRep, typeName, pgNumber, pgCount) {
  halRep.addLink('first', '/api/' + typeName + 's' + '?page=1')
  halRep.addLink('prev', '/api/' + typeName + 's' + '?page=' + (pgNumber < 2 ? 1 : pgNumber - 1))
  halRep.addLink('next', '/api/' + typeName + 's' + '?page=' + (pgNumber < pgCount ? Number(pgNumber, 10) + 1 : pgCount))
  halRep.addLink('last', '/api/' + typeName + 's' + '?page=' + pgCount)
  halRep.addLink('create', {
    href: '/api/' + typeName + 's/' + fn.atob('create'),
    method: 'POST'
  })
  return halRep
}

function createList(ctx) {
  let halRep = undefined
  if (ctx.pageCount > 1) {
    halRep = createPagedListRoot(halson({}), ctx.typeName.toLowerCase(), ctx.pageNumber, ctx.pageCount)
  }
  else {
    halRep = createListRoot(halson({}), ctx.typeName.toLowerCase())
  }
  ctx.result.forEach((el, index, array) => {
    addEmbed(halRep, ctx.typeName.toLowerCase() + 's', el)
  })
  return halRep
}

//todo: add resursion (inner resources)
function createResource(ctx) {
  let halRep = halson({})
  addProperties(halRep, ctx.result)
  addLinks(halRep, ctx.typeName.toLowerCase(), ctx.result)
  addEmbeds(halRep, ctx.typeName.toLowerCase(), ctx.result)
  return halRep
}

exports.func = function(ctx) {
  if(ctx.hal) {
    if (ctx.result instanceof Array) {
      ctx.result = createList(ctx)
    } else {
      ctx.result = createResource(ctx)
    }
  }
  return ctx
}

//---------------------------------------------------------------------------------
//@tests
//---------------------------------------------------------------------------------
const expect = require('expect.js')
log('testing: hal.js')

//TEST EMBEDS
// -------------------------------------------------------------------------------
let apples = [{
  id: '3333',
  weight: 30,
  color: "red",
  valueObj: {
    name: 'abc',
    descr: 'description'
  },
  possibleColors: ['green', 'red', 'orange'],
  // checkList: [{id:1, checked: 11}, {id:2,checked: 22}],
  refObj1: {
    id: '33',
    initials: 'ss'
  },
  refObj2: {
    id: '44',
    prop: 'some property',
    timestamp: Date.now()
  },
  refObj3: {
    id: '55',
    firstName: 'tom',
    lastName: 'peters'
  },
  getLinks: function() {
    if (this.weight > 0.0 && this.weight < 200.0) {
      return [{
        rel: 'grow',
        method: "POST"
      }, {
        rel: 'toss',
        method: "DELETE"
      }]
    }
    return false
  }
}, {
  id: '4444',
  weight: 40,
  color: "orange",
  valueObj: {
    name: '123',
    descr: 'description'
  },
  possibleColors: ['green', 'red', 'orange'],
  // checkList: [{id: 1, checked: 11}, {id: 2, checked: 22}, {id: 3,checked: 33}],
  refObj1: {
    id: '33',
    initials: 'ss'
  },
  refObj2: {
    id: '44',
    prop: 'some property',
    timestamp: Date.now()
  },
  refObj3: {
    id: '55',
    firstName: 'tom',
    lastName: 'peters'
  },
  getLinks: function() {
    if (this.weight > 0.0 && this.weight < 200.0) {
      return [{
        rel: 'grow',
        method: "POST"
      }, {
        rel: 'toss',
        method: "DELETE"
      }]
    }
    return false
  }
}]

//test isEmbed()
//-----------------------------------
let result = isEmbed(apples[0].weight)
expect(result).to.be(false)

result = isEmbed(apples[0].refObj1)
expect(result).to.be(true)

result = isObject(apples[0].refObj1)
expect(result).to.be(true)

//- get all - when result is one obj: createResource()
//-----------------------------------
let ctx = {
  hal: true,
  typeName: 'Apple',
  result: apples[0]
}
let res = exports.func(ctx)
// log(JSON.stringify(res.result))
expect(res.result.listLinkRels().length).to.be(3)
let embeds = res.result.getEmbeds('refObj1')
expect(embeds.length).to.be(1)

//- get all - when result is array: createList()
//-----------------------------------
ctx = {
  hal: true,
  typeName: 'Apple',
  result: apples
}
res = exports.func(ctx)
// log(JSON.stringify(res.result))
embeds = res.result.getEmbeds('apples')
expect(embeds.length).to.be(2)

//TEST PAGING
//-------------------------------------------------------------------------------
// let todos = [{
//               id: '111111',
//               content: '1',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '222222',
//               content: '2',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '333333',
//               content: '3',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '444444',
//               content: '4',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '555555',
//               content: '5',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '666666',
//               content: '6',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '777777',
//               content: '7',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '888888',
//               content: '8',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '999999',
//               content: '9',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '101010',
//               content: '10',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '11111111',
//               content: '11',
//               isDone: false,
//               isArchived: false
//             },
//             {
//               id: '12121212',
//               content: '12',
//               isDone: false,
//               isArchived: false
//             }
// ]
//  //- get all - when result is array: createList()
// //-----------------------------------
// let ctx = {
//   typeName: 'Todo',
//   pgNumber: 3,
//   pgCount: 4,
//   result: todos
// }
// let res = exports.func(ctx)
// log(JSON.stringify(res.result))
// let embeds = res.result.getEmbeds('todos')
// expect(embeds.length).to.be(12)
