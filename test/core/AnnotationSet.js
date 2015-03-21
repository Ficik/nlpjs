require(['nlpjs/core/AnnotationSet', 'nlpjs/core/Document'], function(AnnotationSet, Document){
	AnnotationSet = AnnotationSet.default;
	Document = Document.default;
	
	describe('AnnotationSet', function(){

		function createDummyAnnotationSet(){
			var doc = new Document('Dummy');
			doc.text = 'Lorem';
			return new AnnotationSet(doc, [
			{
				start : 1,
				end : 2,
				type: 'test2',
				features: {}
			}, {
				start : 0,
				end : 1,
				type: 'test1',
				features: {}
			}]);
        }
        it('should have static method for creating annotations', function(){
			var annotation = AnnotationSet.createAnnotation(0, 10, 'type', {major: 'dummy'});
			annotation.type.should.be.exactly('type');
			annotation.start.should.be.exactly(0);
			annotation.end.should.be.exactly(10);
			annotation.features.major.should.be.exactly = 'dummy';
		});

		it('should have properties first, last', function(){
			var annotations = createDummyAnnotationSet();
			annotations.should.have.property('first');
			annotations.should.have.property('last');
			annotations.first.type.should.be.exactly('test1');
			annotations.last.type.should.be.exactly('test2');
		});

		it('should allow storing annotation', function(){
			var annotations = new AnnotationSet();
			annotations.add(0, 10, 'test', {});
			annotations.size.should.be.exactly(1);
			annotations.first.type.should.be.exactly('test');
		});

		it('should Annotation objects', function(){
			var annotations = createDummyAnnotationSet();
			annotations.first.should.have.properties('start', 'end', 'features', 'type', 'text');
		});

		it('should create AnnotationSet from array', function(){
			var annotations = createDummyAnnotationSet();
			annotations.size.should.be.exactly(2);
		});

		it('should allow filtering annotations', function(){
			var annotations = createDummyAnnotationSet();
			var filtered = annotations.filter(function(){
				return true;
			});
			filtered.should.have.property('filter').which.is.a.Function;
		});

		it('should be iterable and ordered', function(){
			var annotations = createDummyAnnotationSet();
			annotations.each(function(annotation, i){
				annotation.should.be.a.Object;
				i.should.be.a.Number;
				if (i == 0){
					annotation.type.should.be.exactly('test1');
				} else if (i == 1) {
					annotation.type.should.be.exactly('test2');
				}
			});
		});

		it('should allow fetching annotations withing offset', function(){
			var annotations = new AnnotationSet();
			annotations.add(2, 6, 'one', {});
			annotations.add(3, 5, 'two', {});
			annotations.add(2, 3, 'three', {});
			annotations.get(1).size.should.be.exactly(2); // matches one and three
			annotations.get(1, 6).size.should.be.exactly(3); // matches all
			annotations.get(4, 4).size.should.be.exactly(2); // matches one and two
		});

		it('should allow iterating with each method', function(){
			var annotations = createDummyAnnotationSet();
			var i = 0;
			annotations.each(function(annotation){
				annotation.should.be.an.Object;
				i += 1;
			});
			i.should.be.exactly(2);
		});

		it('should have listener for adding annotations', function(){
			var annotations = new AnnotationSet();
			var called = 0;
			annotations.listen('add', function(annotations){
				annotations[0].should.be.an.Object.which.have.properties('start', 'end', 'type', 'features');
				called += 1;
			});
			annotations.add(0, 1, 'test', {});
			annotations.add(AnnotationSet.createAnnotation(0, 1, 'test', {}));
			annotations.add([AnnotationSet.createAnnotation(0, 1,'test', {})]);
			called.should.be.exactly(3);
		});

		it('should allow annotation cloning', function(){
			var annotation = AnnotationSet.createAnnotation(0,10,'type',{});
			var clone = AnnotationSet.cloneAnnotation(annotation);
			clone.start = 5;
			clone.end.should.be.exactly(10);
			annotation.start.should.be.exactly(0);
		});

		it('should have map method', function(){
			var annotations = new AnnotationSet();
			annotations.add(0,0,'type',{});
			annotations.add(1,1,'type',{});
			var it = -1;
			annotations.map(function(x, i){
				i.should.be.exactly(it+1);
				it = i;
				x.should.have.properties('start', 'end', 'type', 'features');
				return x.type;
			}).should.be.an.Array;
		});

	});
});
