require(['nlpjs/extras/Tokenizer', 'nlpjs/extras/tokenizer/cs', 'nlpjs/core/Document'], function(Tokenizer, CsTokenizer, Document){
	describe('Tokenizer', function(){

		var IPSUM = 'Lorem ipsum dolor sit amet';
		var tokenizer = new Tokenizer();

		it('should tokenize document with "word" annotation type', function(){
			var doc = new Document('Doc');
			doc.text = IPSUM;
			tokenizer.words(doc);
			doc.annotations.type('word').size.should.be.exactly(5);
		});

		it('should tokenize document with "sentence" annotation type', function(){
			var doc = new Document('Doc');
			doc.text = IPSUM+'. '+IPSUM+'. ';
			tokenizer.sentences(doc);
			doc.annotations.type('sentence').size.should.be.exactly(2);
		});

		it('should tokenize document with "sentence" and "word" annotation type', function(){
			var doc = new Document('Doc');
			doc.text = IPSUM+'. '+IPSUM+'. ';
			tokenizer.tokenize(doc);
			doc.annotations.type('sentence').size.should.be.exactly(2);
			doc.annotations.type('word').size.should.be.exactly(10);
		});

		it('should match as single sentence with czech tokenizer', function(){
				var doc = new Document('Doc');
				doc.text = 'Český text obsahující slova atd. v jedné větě. ';
				var tokenizer = new CsTokenizer();

				tokenizer.tokenize(doc);
				doc.annotations.type('sentence').size.should.be.exactly(1);
		})

	});
});
