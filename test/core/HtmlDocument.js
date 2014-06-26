require(['nlpjs/core/HtmlDocument'], function(HtmlDocument){
	describe('HtmlDocument', function(){

		var doc;

		before(function(done){
			fixtures.cache('test_document.html');
			fixtures.cache('czech_recipe.html');
			done();
		});

		it('should parse body', function(){
			var html = fixtures.read('test_document.html');
			var htmlDoc = new HtmlDocument();
			htmlDoc.text = html;
			htmlDoc.text.should.not.containEql('<script>')
			htmlDoc.size.should.be.greaterThan(0);
			htmlDoc.annotations
				.get(htmlDoc.indexOf('Lorem ipsum')).type('html').size
				.should.be.exactly(1);
		});

		it('should parse realworld page (srecepty)', function(){
			var html = fixtures.read('czech_recipe.html');
			var htmlDoc = new HtmlDocument();
			htmlDoc.text = html;
		});

		it('should remove comments and scripts from document', function(){
			var html = fixtures.read('test_document.html');
			var htmlDoc = new HtmlDocument();
			var clean = htmlDoc._cleanupHtml(html);
			html.should.containEql('comment');
			clean.should.not.containEql('comment');
			html.should.containEql('jquery');
			clean.should.not.containEql('jquery');
			clean.should.not.containEql('function')
		});

	});
});