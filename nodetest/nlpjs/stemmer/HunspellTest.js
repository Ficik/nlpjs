require('babel/register');
var fs = require('fs');
var should = require('should');
var Hunspell = require('../../../src/nlpjs/stemmer/hunspell');

describe('Hunspell', function(){

    it('should detect collision rules', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'});
        var stemmer = Hunspell.fromAffix(aff);
        var collisions = stemmer.collisions();
        collisions.should.not.be.empty;
    });

    it('should calculate rule usage on testing data', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_micro.aff.utf8.txt', {'encoding': 'utf-8'});
        var stemmer = Hunspell.fromAffix(aff);
        var sample = fs.readFileSync(__dirname + '/assets/sample.txt', {'encoding': 'utf-8'});

        var stats = stemmer.usage(sample.split(' '));
        stats.should.not.be.empty;
        stats[0].usage.should.be.greaterThan(0);
    });


    it('should create affix stemmer from cs affix dir and sample', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'});

        var stemmer = Hunspell.fromAffix(aff);
        var originRuleCount = stemmer.ruleset.length;

        var sample = fs.readFileSync(__dirname + '/assets/large_sample.txt', {'encoding': 'utf-8'});
        stemmer.usage(sample.replace(/,.(?:\\n)/g, ' ').replace(/\s+/, ' ').split(' '));
        stemmer.removeCollidingRules();

        stemmer.ruleset.length.should.be.lessThan(originRuleCount);

        originRuleCount = stemmer.ruleset.length;
        stemmer.removeUnusedRules();
        stemmer.ruleset.length.should.be.lessThan(originRuleCount);

        var areSame = function(){
            var stem = stemmer.stem(arguments[0]);
            for (var i in arguments){
                should.equal(stem, stemmer.stem(arguments[i]), "For word " + arguments[i]);
            }
        };

        areSame("nádoba", "nádoby", "nádobu");
        areSame("vložím", "vložte", "vložíme");
        areSame("pekárna", "pekárny", "pekárně");

    });
});



