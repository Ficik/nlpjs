import Tokenizer from '../../../src/nlpjs/tokenizer/tokenizer.js';

import Document from '../../../src/nlpjs/core/Document.js';

describe('Tokenizer', function(){

    it('should tokenize lorem ipsum', function(){
        var tokenizer = new Tokenizer();
        var doc = new Document('Lipsum');
        doc.text = "Lorem ipsum dolor sit amet";
        tokenizer.tokenize(doc);
        doc.annotations.type('word').size.should.be.exactly(5);
    });

});