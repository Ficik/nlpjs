require(['nlpjs/extras/Stemmer', 'nlpjs/core/Document', 'nlpjs/extras/Tokenizer'], function(Stemmer, Document, Tokenizer){
	describe('Stemmer', function(){

		var ENGLISH = 'Brown fox jumps over the lazy dog';
		var CZECH   = 'Příliš žluťoučký kůň úpěl ďábelské ódy';
		var tokenizer = new Tokenizer();

		it('should have abstract class', function(){
			var stemmer = new Stemmer.abstract('un');
			stemmer.language.should.be.exactly('un');
			stemmer.should.be.an.Object.and.have.properties('stem', 'language');
		});

		it('should save stems into word tokens', function(){
			var doc = new Document('Fox');
			doc.text = ENGLISH;
			var called = 0;
			var stemmer = Stemmer.abstract.extend(function(){
				this._language = 'id';
			});
			stemmer.prototype._stem = function(word){
					called += 1;
					return word;
				};
			stemmer = new stemmer;
			stemmer.stem(tokenizer.tokenize(doc));
			doc.annotations.type('word').each(function(word){
				word.features.should.have.property('stem');
			});
			called.should.be.exactly(7);
		});

		// blanket breaks this test
		xit('should reject promise if package does not exist', function(done){
			Stemmer.get('un').then(function(x){
				done(Error('Unexistent stemmer was provided'));
			}).catch(function(e){
				done();
			})
		});

		it('should load czech stemmer from url', function(done){
			Stemmer.get('cs').then(function(stemmer){
				stemmer.should.have.property('stem').which.is.a.Function;
				done();
			}).catch(function(e){
				done(e);
			});
		});

		it('should load czech stemmer synchronously', function(){
			var stemmer = Stemmer.get('cs', false);
			stemmer.should.have.property('stem').which.is.a.Function;
		});

		it('should stemm english sentence', function(done){
			var doc = new Document('Brown fox');
			doc.text = ENGLISH;
			tokenizer.tokenize(doc);
			Stemmer.get('en').then(function(stemmer){
				stemmer.stem(doc);
				done();
			}).catch(function(e){
				done(e);
			});
		});

		it('should stemm czech sentence', function(done){
			var doc = new Document('Zlutoucky Kun');
			doc.text = CZECH;
			tokenizer.tokenize(doc);
			Stemmer.get('cs').then(function(stemmer){
				stemmer.stem(doc);
				done();
			}).catch(function(e){
				done(e);
			});
		});

	});
});
