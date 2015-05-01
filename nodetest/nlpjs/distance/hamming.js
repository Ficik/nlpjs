/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */

import Hamming from  '../../../src/nlpjs/distance/hamming';

var should = require('should');

describe('Hamming', function(){

    it('should count correct distance', function(){
       should.equal(Hamming.distance('abc', 'abc'), 0);
       should.equal(Hamming.distance('abd', 'abc'), 1);
       should.equal(Hamming.distance('ddd', 'abc'), 3);
        should.equal(Hamming.distance('abc', ''), undefined);
    });

});