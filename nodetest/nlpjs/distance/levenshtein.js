/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */

import Levenstein from  '../../../src/nlpjs/distance/levenshtein.js';

var should = require('should');

describe('Levenstein', function(){

    it('should have zero distance if strings are same', function(){
        should.equal(Levenstein.distance("abc", "abc"), 0);
        should.equal(Levenstein.distance(new String('cdb'), "cdb"), 0);
        should.equal(Levenstein.distance(new String('cdb'), new String('cdb')), 0);
    });

    it('should return correct distances for default weight', function(){
        should.equal(Levenstein.distance("abcd", "abc"),  1, 'abcd -> abc');
        should.equal(Levenstein.distance("abcdd", "abc"), 2, 'abcdd -> abc');
        should.equal(Levenstein.distance("efg", "abc"),   3, 'efg -> abc');
    });

    it('should return correct distances with changed weights', function() {
        should.equal(new Levenstein(1,1,2).distance("efg", "abc"),    6, 'efg -> abc');
        should.equal(new Levenstein(1,1,3).distance("efg", "abc"),    6, 'efg -> abc');
        should.equal(new Levenstein(3,1,1).distance("abcdef", "abc"), 9, 'abcdef -> abc');
        //should.equal(new Levenstein(1,2,1).distance("abcdef", "abc"), 6);
    });

});