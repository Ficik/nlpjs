require('babel/register');
var fs = require('fs');
var should = require('should');
var Hunspell = require('../../../src/nlpjs/stemmer/hunspell')

describe('Hunspell', function(){

    it('should create affix stemmer from cs affix dir', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'})

        var stemmer = Hunspell.fromAffix(aff);
        //var sample = fs.readFileSync(__dirname + '/assets/sample.txt', {'encoding': 'utf-8'})

        /*sample.split(' ').forEach(function(word){
            console.log(word.trim() + ':\t', stemmer.stem(word));
        });*/
        stemmer.stem("nádoby").should.be.exactly("nádoba");
        stemmer.stem("pekárny").should.be.exactly("pekárna");
        stemmer.stem("vložíme").should.be.exactly("vložit");
        stemmer.stem("těsto").should.be.exactly("těsto");
    });

    it('should detect collision rules', function(){
        var aff = fs.readFileSync(__dirname + '/assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'})
        var stemmer = Hunspell.fromAffix(aff);
        stemmer.collisions().should.not.be.empty();
    });

});



