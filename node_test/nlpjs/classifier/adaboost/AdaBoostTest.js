require('babel/register');
var fs = require('fs');
var should = require('should');
var AdaBoost = require('../../../../src/nlpjs/classifier/adaboost');

describe('Adaboost', function () {

    it('should add weak classifier', function(){
        var classifier = new AdaBoost();
        classifier.addWeakClassifier(function(object){
            return object.indexOf('a') === -1 ? 'B': 'A';
        });
    });

    xit('should create strong classifier from training set', function(){
        var classifier = new AdaBoost();
        classifier.addWeakClassifier(function(object){
            return object.indexOf('a') === -1 ? -1: 1;
        });

        classifier.addWeakClassifier(function(object){
            return object.indexOf('aa') === -1 ? -1: 1;
        });

        classifier.addWeakClassifier(function(object){
            return object.indexOf('aaa') === -1 ? -1: 1;
        });

        classifier.train(
            ['aa', 'aab', 'baa', 'a'],
            ['bb', 'bba', 'abb']
        );

        should.equal(classifier.classify('aaa'), 1);
        should.equal(classifier.classify('bba'), -1);
        should.equal(classifier.classify('baa'), 1);
        should.equal(classifier.classify('a'), 1);
    });
});