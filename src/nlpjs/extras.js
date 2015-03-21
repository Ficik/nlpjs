define('nlpjs/extras', [
    'nlpjs/extras/NGram',
    'nlpjs/extras/Stemmer',
    'nlpjs/extras/Tokenizer'
],function(NGram, Stemmer, Tokenizer){
    return {
        NGram     : NGram,
        Stemmer   : Stemmer,
        Tokenizer : Tokenizer
    };
});
