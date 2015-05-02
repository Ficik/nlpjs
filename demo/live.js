import Document from '../src/nlpjs/core/Document';
import Tokenizer from '../src/nlpjs/tokenizer/Tokenizer';
import NGram from '../src/nlpjs/classifier/ngram';
import Levenshtein from '../src/nlpjs/distance/levenshtein';
import EnStemmer from '../src/nlpjs/extras/stemmer/en';


var input = document.getElementById('demoArea');
var result = document.getElementById('result');

var render = function(document, ngrams, mostSimilar){
    if (document.text.trim() === ''){
        result.innerHTML = '';
    }
    result.innerHTML = `
    <dl>
        <dd>Number of words</dd>
        <dt>${document.annotations.type('word').length}</dt>
        <dd>Sentences</dd>
        <dt>${document.annotations.type('sentence').length}</dt>
        <dd>Stem of the last word</dd>
        <dt>${document.annotations.type('word').last.features.stem}</dt>
        <dd>Most frequent trigrams</dd>
        <dt>${ngrams.join(', ')}</dt>
        <dd>Most similar words</dd>
        <dt>${mostSimilar.join(', ')}</dt>
    </dl>
    `;
};

var tokenizer = new Tokenizer();
var stemmer   = new EnStemmer();

var mostSimilarWords = function(words){
    var best = Infinity;
    var mostSimilar;
    for (var i=0, ii=words.length;i<ii;i++){
        var word = words[i];
        for (var j=i+1, jj=words.length;j<jj;j++){
            var distance = Levenshtein.distance(word, words[j]);
            if (distance > 0 && distance < best){
                best = distance;
                mostSimilar = [word, words[j]];
            }
        }
    }
    return mostSimilar || ['type more unique words'];
};

input.addEventListener('input', function(event){
    var document = new Document();
    document.text = input.value||'';
    tokenizer.tokenize(document);
    stemmer.stemDocument(document);
    var ngrams = NGram.ranked(NGram.compute(document.text, 3, 3)).slice(0, 3);
    var words = document.annotations.type('word').map((annotation) => annotation.text);
    render(document, ngrams, mostSimilarWords(words));
});