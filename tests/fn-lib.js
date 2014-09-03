if (typeof Object.create !== 'function'){
    Object.create = function (o) {
        var F = function () {};
        F.prototype = o;
        return new F();
    };
}

Object.prototype.method = function (name, func) {
    if (!this.prototype[name]){
        this.prototype[name] = func;
        return this;
    }
};

Object.method('implement', function (iface) {
    var obj = this;
    for(var prop in iface){
        if (!obj[prop]){
            obj[prop] = iface[prop];
        }
    }
    return obj;
});

Object.method('isArray', function (){
    return Object.prototype.toString.call(this) == '[object Array]';
});

Object.method('getKeys', function (){
    var list = [];
    for(var key in this){
        list.push(key);
    }
    return list;
});

/* Determines whether at least one element is truthy (boolean-equivalent to true), either directly or through computation by the provided iterator. */
Object.prototype.any = function(iterator) {
    if ((this instanceof Array) &&
        (this.length > 0)) {
        if (typeof iterator === 'function') {
            for (var i = 0; i < this.length; i++) {
                if (iterator(this[i])) {
                    return true;
                }
            }
        }
        else {
            return true;
        }
    }
    return false;
};

/* Returns the first element for which the iterator returns a truthy value. */
Object.prototype.detect = function(iterator) {
    if ((this instanceof Array) &&
        (this.length > 0)) {
        if (typeof iterator === 'function') {
            for (var i = 0; i < this.length; i++) {
                if (iterator(this[i])) {
                    return this[i];
                }
            }
        }
        else {
            return this[0];
        }
    }
    return null;
};

/* Returns all the elements for which the iterator returned a truthy value. For the opposite operation, see Object#reject. */
Object.prototype.findAll = function(iterator) {
    var resultSet = [];
    if ((this instanceof Array) &&
        (this.length > 0)) {
        if (typeof iterator === 'function') {
            for (var i = 0; i < this.length; i++) {
                if (iterator(this[i])) {
                    resultSet.push(this[i]);
                }
            }
        }
        else {
            resultSet = this;
        }
    }
    return resultSet;
};

/* Returns all the elements for which the iterator returns a falsy value. For the opposite operation, see Object#findAll. */
Object.prototype.reject = function(iterator) {
    var resultSet = [];
    if ((this instanceof Array) &&
        (this.length > 0)) {
        if (typeof iterator === 'function') {
            for (var i = 0; i < this.length; i++) {
                if (!iterator(this[i])) {
                    resultSet.push(this[i]);
                }
            }
        }
        else {
            resultSet = this;
        }
    }
    return resultSet;
};

/* Determines whether all the elements are "truthy" (boolean-equivalent to true), either directly or through computation by the provided iterator. Stops on the first falsy element found. */
Object.prototype.all = function(iterator) {
    if ((this instanceof Array) &&
        (this.length > 0)) {
        if (typeof iterator === 'function') {
            for (var i = 0; i < this.length; i++) {
                if (!iterator(this[i])) {
                    return false;
                }
            }
            return true;
        }
        else {
            return true;
        }
    }
    return false;
};

Array.method('indexOf', function (obj, fromIndex) {
    if (fromIndex === null) {
        fromIndex = 0;
    } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
});



Number.method('int', function(){
    return Math[this < 0 ? 'ceil' : 'floor'](this);
});

String.method('trim', function (){
    return this.replace(/^\s+|\s+$/g, '');
});

String.method('startsWith', function (str){
    return (this.indexOf(str) === 0);
});

var leafy = (function (){
    var leafy = function(obj, predicate) {
        return new leafy.fn.init(obj, predicate);
    },
    root,
    attribute_regex = /(\w+)(=|\^=|\?=|$=)('|")([^"\\]*(\\.[^"\\]*)*)('|")/gi,
    part_regex = /\w+(?=\[)/gi,
    navigate = function (obj, predicate){
        if (obj && predicate){
            var parts = predicate.split(/\./);
            for(var i = 0; i < parts.length; ++i){
                var part = parts[i];
                var attrib = null;
                if (part && part.match(attribute_regex)){
                    attrib = part.match(attribute_regex);
                    part = part.match(part_regex) || '';
                }

                obj = obj && obj[part] ? obj[part] : null;
                if (obj && obj.isArray()){
                    var attribParts = attrib.toString().split(/(\w+)(=|^=)"([^"]*)"/).findAll(function (v) { return v && v !== ''; });
                    if (attribParts.length === 3){
                        var aName = attribParts[0],
                            //aOp = attribParts[1],
                            aComp = attribParts[2],
                            useThis = aName.toLowerCase() === 'this';
                        obj = obj.findAll(function(v){
                            return useThis ? v == aComp : v[aName] == aComp;
                        });
                    }
                    else
                        throw 'Malformed array filter expression';
                }
                if (!obj) break;
            }
        }
        return obj;
    };

    leafy.fn = leafy.prototype = {
        constructor : leafy,
        init : function (_root, predicate){
            root = navigate(_root, predicate);
        },
        select : function (predicate) {
            if (typeof predicate === 'function' && root){
                return new leafy.fn.init(predicate(root));
            }
            else if (root && predicate){
                root = navigate(root, predicate);
                return new leafy.fn.init(root);
            }
            else {
                return new leafy.fn.init(null);
            }
        },
        prop : function (name, value) {
            if (root){
                root[name] = value;
            }
            return new leafy.fn.init(root);
        },
        val : function(_val){
            if (_val){
                root = _val;
            }
            return root || null;
        }
    };

    leafy.fn.init.prototype = leafy.fn;

    return leafy;
})();

// -- dataContext object that will wrap and provide search/sort implementations
var dataContext = (function (){
    var _data;
    return {
        sort : function (){
            var result = [];
            if (_data && _data.Persons){
                for(var i = 0; i < _data.Persons.length; ++i){
                    result.push(_data.Persons[i]);
                }
            }
            return result;
        },
        search : function (){
            var result = [];
            if (_data && _data.Persons){
                for(var i = 0; i < _data.Persons.length; ++i){
                    result.push(_data.Persons[i]);
                }
            }
            return result;
        },
        load : function (loader){
            _data = loader();
        }
    };
})();

var log = console.log;

var createPM = function (){
    return {
        Persons : [
            {
                ID : '1:0:0',
                GeneralAttributes : [
                    { Type : 'Facebookid', Value : '686199744'},
                    { Type : 'Distance', Value : '0'}
                ],
                Events : [],
                Genders : [ { Value : 'Male' }],
                Names : [{ Given : 'James', Surname : 'White'}],
                Relations : []
            }
        ]
    };
};

dataContext.load(createPM);
var pm = dataContext.sort();
log(pm[0].ID);

var person = {
    first : 'james',
    last : 'white',
    address : {
        addr : '',
        city : 'stansbury park',
        state : 'ut'
    },
    creditcards : [
        { name : 'james',   cardnumber : '4747474747474747' },
        { name : 'krystal', cardnumer : '4444333322221111' },
        { name : 'james',   cardnumber : '4444333322221111' }],
    numbers : [1,2,3,4,5]
};
var employee = { person :  person };
var op1 = leafy(employee, 'person.numbers[this="3"]').val();
log(op1);

var op2 = leafy(employee, 'person.creditcards[name="james"]').val();
// $.each(op2, function (i,v){
    // log(v.name + '-' + v.cardnumber);
// });
var op3 = leafy(employee).select('person').select('address').select('city').val();
log(op3);



