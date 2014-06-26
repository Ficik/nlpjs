require(['nlpjs/core/Document', 'nlpjs/core/AnnotationSet'], function(Document, AnnotationSet){
	describe('Document', function(){

		var IPSUM = 'Lorem ipsum dolor sit amet';

		it('should allow set and get text', function(){
			var doc = new Document('The Document');
			doc.text = IPSUM;
			doc.text.should.be.exactly(IPSUM);
		});

		it('should allow add and fetch annotations', function(){
			var doc = new Document('The Document');
			doc.text = IPSUM;
			doc.annotations.should.be.instanceOf(AnnotationSet);
			doc.annotations.add(0, 5, 'Lorem');
			doc.annotations.get(0).first.type.should.be.exactly('Lorem');
			doc.annotations.get(6).isEmpty.should.be.ok;
		});

		it('should have indexOf for strings', function(){
			var doc = new Document('The Document');
			doc.text = IPSUM;
			doc.indexOf('ipsum').should.be.exactly(6);
		});

	});
});