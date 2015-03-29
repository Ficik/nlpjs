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

        var stats = stemmer.usage(sample.split(' '), true);

        stats.should.not.be.empty;
        stats[0].usage.should.be.greaterThan(0);
    });


    xit('should serialize to json and deserialize from it', function(){
        throw "Not Implemented";
    });

    it('should calculate dict usage on testing data', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'});
        var stemmer = Hunspell.fromAffix(aff);
        var sample = fs.readFileSync(__dirname + '/assets/sample.txt', {'encoding': 'utf-8'});
        stemmer.dictionary(fs.readFileSync(__dirname + '/assets/cs_CZ.dic.utf8.txt', {'encoding': 'utf-8'}));

        var stats = stemmer.usage(sample.split(' '));

        stemmer.dict['nádoba'].usage.should.be.above(0);
    });

    it('should find correct rule using full dictionary', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'});
        var stemmer = Hunspell.fromAffix(aff);
        var dictionary = fs.readFileSync(__dirname + '/assets/cs_CZ.dic.utf8.txt', {'encoding': 'utf-8'});
        stemmer.dictionary(dictionary);
        stemmer.dict['nádoba'].cls.should.be.exactly('ZQ');
        stemmer.dict['vložit'].cls.should.be.exactly('ATN');
        stemmer.dict['pekárna'].cls.should.be.exactly('ZQ');

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

    xit('should create stemmer from cs affix rules and train it by sample file and dictionary', function(){
        this.timeout(30000);
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'});

        var stemmer = Hunspell.fromAffix(aff);
        var originRuleCount = stemmer.ruleset.length;

        var dictionary = fs.readFileSync(__dirname + '/assets/cs_CZ.dic.utf8.txt', {'encoding': 'utf-8'});
        stemmer.dictionary(dictionary);

        var sample = fs.readFileSync(__dirname + '/assets/large_sample.txt', {'encoding': 'utf-8'});
        stemmer.usage(sample.replace(/,.(?:\\n)/g, ' ').replace(/\s+/, ' ').split(' '));
        //stemmer.removeCollidingRules();

        //stemmer.ruleset.length.should.be.lessThan(originRuleCount);

        originRuleCount = stemmer.ruleset.length;
        stemmer.removeUnusedRules();
        stemmer.ruleset.length.should.be.lessThan(originRuleCount);

        var areSame = function(){
            var stem = stemmer.stem(arguments[0]);
            for (var i in arguments){
                should.equal(stem, stemmer.stem(arguments[i]), "For word " + arguments[i]);
            }
        };

        stemmer.resort();

        console.log(stemmer.removeUnusedDictEntries(), Object.keys(stemmer.dict).length);


        var test = fs.readFileSync(__dirname + '/assets/sample.txt', {'encoding': 'utf-8'});
        test = test.replace(/,.(?:\\n)/g, ' ').replace(/\s+/, ' ').split(' ')
        for (var i in test){
            console.log(test[i], stemmer.stem(test[i]));
        }

        areSame("nádoba", "nádoby", "nádobu");
        areSame("vložím", "vložte", "vložíme");
        areSame("pekárna", "pekárny", "pekárně");

    });
});



