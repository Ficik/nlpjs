require(['nlpjs/core/Corpus', 'nlpjs/core/Document'], function(Corpus, Document){
	Corpus = Corpus.default;
	Document = Document.default;

	describe('Corpus', function(){

		it('should have name', function() {
			var name = 'The Corpus';
			var corpus = new Corpus(name);
			corpus.name.should.be.exactly(name);
		});

		it('should be capable of holding multiple documents', function(){
			var corpus = new Corpus('The corpus');
			var doc1 = new Document('Document one');
			var doc2 = new Document('Document two');

			corpus.add(doc1);
			corpus.add(doc2);

			corpus.size.should.be.exactly(2);
		});

		it('should fetch document by name', function(){
			var name = 'The Document';
			var doc = new Document(name);
			var corpus = new Corpus('The Corpus');

			corpus.add(doc);

			corpus.document(name).should.be.exactly(doc);
			(corpus.document('unknowned') === undefined).should.be.ok;
		});

		it('should act as document containing documents', function(){
			var corpus = new Corpus('The corpus');
			var doc1 = new Document('Document one');
			var doc2 = new Document('Document two');

			doc1.text = 'Content of first document.';
			doc2.text = 'Content of second document.';

			corpus.add(doc1);
			corpus.add(doc2);

			corpus.text.should.be.exactly('Content of first document.' + 'Content of second document.');

			doc1.annotations.add(0,10, 'test', {});
			doc2.annotations.add(0,10, 'test', {});
			var annotations = corpus.annotations.type('test');
			annotations.size.should.be.exactly(2);
			annotations.last.start.should.be.exactly(26);
		});

		it('should save annotations', function(){
			var corpus = new Corpus('The corpus');
			var doc1 = new Document('Document one');
			var doc2 = new Document('Document two');

			doc1.text = 'Content of first document.';
			doc2.text = 'Content of second document.';

			corpus.add(doc1);
			corpus.add(doc2);

			corpus.annotations.type('test1').size.should.be.exactly(0);
			corpus.annotations.add(0, corpus.text.length, 'test1', {});
			corpus.annotations.type('test1').size.should.be.exactly(1);
		});

	});
});
