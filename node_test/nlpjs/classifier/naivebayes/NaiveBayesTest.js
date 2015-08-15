require('babel/register');
var fs = require('fs');
var should = require('should');
var NaiveBayes = require('../../../../src/nlpjs/classifier/naivebayes');

describe('Naive Bayes', function(){

    it('should add one class occurences of feature', function(){
        var classifier = new NaiveBayes();
        classifier.addClassifiedOccurrences('A', ['aa', 'aa', 'aab']);
        classifier.addClassifiedOccurrences('B', ['bb', 'aab', 'aab']);
        classifier.classProbability('A', 'aa').should.be.exactly((2 + 1)/(3 + 3));
        classifier.classProbability('A', 'bb').should.be.exactly((0 + 1)/(3 + 3));
        classifier.classProbability('A', 'aab').should.be.exactly((1 + 1)/(3 + 3));
        classifier.classProbability('B', 'aa').should.be.exactly((0 + 1)/(3 + 3));
        classifier.classProbability('B', 'bb').should.be.exactly((1 + 1)/(3 + 3));
        classifier.classProbability('B', 'aab').should.be.exactly((2 + 1)/(3 + 3));
    });

    it('should learn by provided training set', function(){
        var classifier = new NaiveBayes();
        classifier.train({
            'A': ['aa', 'aab', 'baa'],
            'B': ['bb', 'bba', 'abb']
        });

        should.equal(classifier.classify(['aa', 'bb', 'baa']), 'A', 'Features miss classified');
        should.equal(classifier.classify(['bb', 'bb', 'bba']), 'B', 'Features miss classified');
    });

    it('should serialize and deserialize trained model', function(){
        var classifier = new NaiveBayes();
        classifier.train({
            'A': ['aa', 'aab', 'baa'],
            'B': ['bb', 'bba', 'abb']
        });

        var json = JSON.stringify(classifier.save());
        classifier = NaiveBayes.load(JSON.parse(json));
        should.equal(classifier.classify(['aa', 'bb', 'baa']), 'A', 'Features miss classified');
        should.equal(classifier.classify(['bb', 'bb', 'bba']), 'B', 'Features miss classified');

    });

    it('should select 4 most significant features', function(){
        var classifier = new NaiveBayes();
        classifier.train({
            'A': ['aa', 'bb', 'aab', 'aab'],
            'B': ['aa', 'bb', 'bb', 'abb']
        });

        var features = classifier.mostSignificant(3);
        features.should.not.containEql('aa');
        should.equal(features[0], 'aab');
    });

    it('should remove feature', function(){
        var classifier = new NaiveBayes();
        classifier.train({
            'A': ['aa', 'bb', 'aab', 'aab'],
            'B': ['aa', 'bb', 'bb', 'abb']
        });
        classifier.significance('bb').should.be.above(0);
        classifier.removeFeature('bb');
        classifier.significance('bb').should.be.exactly(0);
    });

    it('should remove unsignificant features', function(){
        var classifier = new NaiveBayes();
        classifier.train({
            'A': ['aa', 'bb', 'aab', 'aab'],
            'B': ['aa', 'bb', 'bb', 'abb']
        });
        classifier.removeUnsignificantFeatures();
        should.equal(classifier._model['aa'], undefined);
    });

    it('classify as background', function(){
        var classifier = new NaiveBayes();
        var diff = function(prob){
            return prob.positive - prob.background;
        };

        classifier.train({
            'background': ['bc', 'cc'],
            'positive': ['aa']
        });
        classifier.addClassifiedOccurrences('positive', ['bb']);
        classifier.addClassifiedOccurrences('positive', ['bb', 'bb']);
        classifier.addClassifiedOccurrences('positive', ['abb', 'abb']);

        (diff(classifier.probabilities(['bb', 'abb'])));
        (diff(classifier.probabilities(['bb', 'bb'])));
        (diff(classifier.probabilities(['cc', 'aa', 'aa', 'bc','abb'])));
        (diff(classifier.probabilities(['cc', 'cd'])));
        (diff(classifier.probabilities(['cc', 'cd', 'ac', 'cb'])));

    });

});