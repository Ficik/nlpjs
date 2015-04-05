require(['nlpjs/extras/NGram', 'nlpjs/core/Document'], function(NGram, Document){
	describe('Ngram', function(){

		var ipsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
		Maecenas eu nunc rutrum, malesuada velit eget, faucibus velit.\
		Vestibulum ac facilisis mauris. Duis consectetur vulputate sodales. \
		Quisque in dolor accumsan, vehicula dui vitae, consequat mauris. \
		Praesent et ornare lectus. Nulla facilisi. Vestibulum faucibus quis magna ut varius. \
		Pellentesque sed rutrum dolor. Fusce pellentesque diam et urna ultrices, \
		nec elementum ligula ullamcorper. Sed imperdiet mauris a nisl aliquet, \
		sit amet scelerisque elit ullamcorper. Praesent tristique ante tortor.\
		Nullam semper purus at enim aliquet, a aliquet quam imperdiet. Mauris neque mauris, \
		imperdiet sit amet tempus nec, placerat ut velit. Donec nec iaculis lorem, \
		volutpat sollicitudin libero. Pellentesque non hendrerit justo.";

		var czech = 'Jahody (2 nechte na ozdobu) a 2 lžíce cukru rozmixujte do pyré. Připravte si dvě skleničky a na dno každé dejte 3 lžíce pyré, po dvou lžičkách cukru a 2 lžících citronové šťávy. Promíchejte, zasypte ledem a dolijte sodovkou. Podávejte ozdobené jahodami a melounem.';

		it('should calculate ngrams of ipsum', function(){
			var doc = new Document('doc');
			doc.text = ipsum;
			var ngrams = NGram.ngrams(doc, 3);
			ngrams.should.have.property('sit', 3);
		});

		it('should export/import data', function(){
			var doc = new Document('doc');
			doc.text = ipsum;
			var json = NGram.export({
				ipsum : NGram.stats(doc, 2, 3)
			});
			var imported = NGram.import(json);
			imported.should.have.property('ipsum').which.is.an.Array.and.have.lengthOf(300);
		});

		it('should import data from url', function(done){
			var promise = NGram.importUrl('../assets/ngram.model.json');
			promise.then(function(x){
					x.should.have.property('cs').which.is.an.Array;
					done();
				}).catch(function(e){
					done(e);
				});
		});

		it('should detect text as czech', function(done){
			var doc = new Document('czech');
			doc.text = czech;
			NGram.importUrl('../assets/ngram.model.json').then(function(model){
				var results = NGram.compare(doc, 300, 2, 3)(model.cs, model.en, model.sk);
				console.log(results);
				results[0].should.be.below(results[1]).and.below(results[2]);
				done();
			})
			.catch(function(e){
				done(e);
			});
		});


	});
});