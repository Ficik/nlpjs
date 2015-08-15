var should = require('should');
import NGram from '../../../../src/nlpjs/classifier/ngram.js'

describe('NGram', function(){

    it('should calculate n-grams from text', function(){
        NGram.compute("lorem", 1, 1).should.have.keys([
            'l', 'o', 'r', 'e', 'm'
        ]);

        NGram.compute("lorem", 2, 2).should.have.keys([
            '_l', 'lo', 'or', 're', 'em', 'm_'
        ]);

        NGram.compute("lor", 1, 3).should.have.keys([
            'l', 'o', 'r',
            '_l', 'lo', 'or', 'r_',
            '_lo', 'lor', 'or_'
        ]);
    });

    it('should return list of ngrams sorted by rank', function(){
        NGram.ranked(NGram.compute("aabbbdc", 1, 1))
            .should.eql(['b', 'a', 'c', 'd']);
    });

    it('should calculate distance between models', function(){
        var A = NGram.compute('aabbbdc', 1, 1),
            B = NGram.compute('aaabbdc', 1, 1);
        var distance = NGram.distance(NGram.ranked(A), NGram.ranked(B));
        should.equal(distance, 2, "Wrong distance");
    });

    it('should create classifier with model from text', function(){
       var classifier = NGram.fromText({
           'lo': 'Lorem ipsum dolor sit amet',
           'cs': 'Tohle je česká věta'
       }, 1, 3, 300);

        classifier.classify('česky').should.be.exactly('cs');
        classifier.classify('sumit').should.be.exactly('lo');
    });

    it ('should serialize model to json', function(){
        var classifier = NGram.fromText({
            'lo': 'Lorem ipsum dolor sit amet',
            'cs': 'Tohle je česká věta'
        }, 1, 3, 300);

        var json = classifier.toJSON();
        var deserialized = NGram.fromJSON(json);

        deserialized.classify('česky').should.be.exactly('cs');
    });

});