
describe('Mapping helpers', {    
    'ko.fromJS should require a parameter': function() {
        var didThrow = false;
        try { ko.fromJS() }
        catch(ex) { didThow = true }    	
        value_of(didThow).should_be(true);
    },
    
    'ko.fromJS should return an observable if you supply an atomic value': function() {
        var atomicValues = ["hello", 123, true, null, undefined];
        for (var i = 0; i < atomicValues.length; i++) {
            var result = ko.fromJS(atomicValues[i]);
            value_of(ko.isObservable(result)).should_be(true);
            value_of(result()).should_be(atomicValues[i]);
        }
    },
    
    'ko.fromJS should return an observableArray if you supply an array, but should not wrap its entries in further observables': function() {
        var sampleArray = ["a", "b"];
        var result = ko.fromJS(sampleArray);
        value_of(typeof result.destroyAll).should_be('function'); // Just an example of a function on ko.observableArray but not on Array
        value_of(result().length).should_be(2);
        value_of(result()[0]).should_be("a");
        value_of(result()[1]).should_be("b");
    },    
    
    'ko.fromJS should not return an observable if you supply an object that could have properties': function() {
        value_of(ko.isObservable(ko.fromJS({}))).should_be(false);
    },    
    
    'ko.fromJS should map the top-level properties on the supplied object as observables': function() {
        var result = ko.fromJS({ a : 123, b : 'Hello', c : true });
        value_of(ko.isObservable(result.a)).should_be(true);
        value_of(ko.isObservable(result.b)).should_be(true);
        value_of(ko.isObservable(result.c)).should_be(true);
        value_of(result.a()).should_be(123);
        value_of(result.b()).should_be('Hello');
        value_of(result.c()).should_be(true);
    },
    
    'ko.fromJS should map descendant properties on the supplied object as observables': function() {
        var result = ko.fromJS({ 
            a : { 
                a1 : 'a1value',
                a2 : {
                    a21 : 'a21value',
                    a22 : 'a22value'
                }
            }, 
            b : { b1 : null, b2 : undefined }
        });
        value_of(result.a.a1()).should_be('a1value');
        value_of(result.a.a2.a21()).should_be('a21value');
        value_of(result.a.a2.a22()).should_be('a22value');
        value_of(result.b.b1()).should_be(null);
        value_of(result.b.b2()).should_be(undefined);
    },
    
    'ko.fromJS should map observable properties, but without adding a further observable wrapper': function() {
        var result = ko.fromJS({ a : ko.observable('Hey') });
        value_of(result.a()).should_be('Hey');    	
    },
    
    'ko.fromJS should escape from reference cycles': function() {
        var obj = {};
        obj.someProp = { owner : obj };
        var result = ko.fromJS(obj);
        value_of(result.someProp.owner).should_be(result);
    },
    
    'ko.fromJSON should parse and then map in the same way': function() {
        var jsonString = ko.utils.stringifyJson({  // Note that "undefined" property values are omitted by the stringifier, so not testing those
            a : { 
                a1 : 'a1value',
                a2 : {
                    a21 : 'a21value',
                    a22 : 'a22value'
                }
            }, 
            b : { b1 : null }
        });
        var result = ko.fromJSON(jsonString);
        value_of(result.a.a1()).should_be('a1value');
        value_of(result.a.a2.a21()).should_be('a21value');
        value_of(result.a.a2.a22()).should_be('a22value');
        value_of(result.b.b1()).should_be(null);
    },
    
    'ko.toJS should unwrap observable values': function() {
        var atomicValues = ["hello", 123, true, null, undefined, { a : 1 }];
        for (var i = 0; i < atomicValues.length; i++) {
            var data = ko.observable(atomicValues[i]);
            var result = ko.toJS(data);
            value_of(ko.isObservable(result)).should_be(false);
            value_of(result).should_be(atomicValues[i]);
        }
    },
    
    'ko.toJS should unwrap observable properties, including nested ones': function() {
        var data = {
            a : ko.observable(123),
            b : {
                b1 : ko.observable(456),
                b2 : 789
            }
        };
        var result = ko.toJS(data);
        value_of(result.a).should_be(123);
        value_of(result.b.b1).should_be(456);
        value_of(result.b.b2).should_be(789);
    },
    
    'ko.toJS should unwrap observable arrays and things inside them': function() {
        var data = ko.observableArray(['a', 1, { someProp : ko.observable('Hey') }]);
        var result = ko.toJS(data);
        value_of(result.length).should_be(3);
        value_of(result[0]).should_be('a');
        value_of(result[1]).should_be(1);
        value_of(result[2].someProp).should_be('Hey');
    },
    
    'ko.toJSON should unwrap everything and then stringify': function() {
        var data = ko.observableArray(['a', 1, { someProp : ko.observable('Hey') }]);	
        var result = ko.toJSON(data);
        
        // Check via parsing so the specs are independent of browser-specific JSON string formatting
        value_of(typeof result).should_be('string');
        var parsedResult = ko.utils.parseJson(result);
        value_of(parsedResult.length).should_be(3);
        value_of(parsedResult[0]).should_be('a');
        value_of(parsedResult[1]).should_be(1);
        value_of(parsedResult[2].someProp).should_be('Hey');		
    }
})