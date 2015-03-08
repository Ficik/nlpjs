require('babel/register')
var fs = require('fs')
var Hunspell = require('../../../src/nlpjs/stemmer/hunspell')

var aff = fs.readFileSync('assets/cs_CZ.aff.utf8.txt', {'encoding': 'utf-8'})
stemmer = Hunspell.fromAffix(aff);


var sample = fs.readFileSync('assets/sample.txt', {'encoding': 'utf-8'})

sample.split(' ').forEach(function(word){
  console.log(word.trim() + ':\t', stemmer.stem(word))
})
