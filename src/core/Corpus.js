define(['nlpjs/core/Container', 'nlpjs/core/AnnotationSet'], function(Container, AnnotationSet){

	/**
	 * Corpus for language linguistic, that contains multiple documents
	 * and provides and provides methods to interact with all of them
	 * as a single document.
	 * @constructor
	 * @name nlpjs.core.Corpus
	 * @param {string} name descriptive name of the corpus
	 * @extends nlpjs.core.Container
	 */
	Corpus = Container.extend(function(name) {
		this._documents = [];
		this._annotations = new AnnotationSet(this);
	})
	.methods({
		/**
		 * Adds document to corpus
		 * @method
		 * @name nlpjs.core.Corpus#add
		 * @param {nlpjs.core.Document} doc [description]
		 */
		add : function(doc) {
			var buffer = [];
			var addAnnotations = (function(offset, self){
				return function(ann){
					ann = ann.map(function(a){
						a = AnnotationSet.cloneAnnotation(a);
						a.start += offset;
						a.end += offset;
						return a;
					});
					self._annotations.add(ann);
				};
			})(this.text.length, this);

			doc.annotations.each(function(annotation){
				buffer.push(annotation);
			});

			doc.annotations.listen('add', function(a){
				addAnnotations(a)
			});

			this._documents.push(doc);
			addAnnotations(buffer);

			return this;
		},
		/**
		 * Get document by name
		 * @method
		 * @name nlpjs.core.Corpus#document
		 * @param {string} name name of the document
		 * @returns {nlpjs.core.Document}
		 */
		document : function(name) {
			for (var i in this._documents)
				if (this._documents[i].name == name)
					return this._documents[i];
			return undefined;
		}
	});

	Object.defineProperty(Corpus.prototype, 'size', {
		/**
		 * Number of documents in this corpus
		 * @instance
		 * @name nlpjs.core.Corpus#size
		 * @readonly
		 * @memberof nlpjs.core.Corpus
		 * @type {number}
		 */
		get : function() {
			return this._documents.length;
		}
	});

	Object.defineProperty(Corpus.prototype, 'text', {
		/**
		 * Concated text of all documents.
		 * Documents are concated in order
		 * they were added to this corpus
		 * @name nlpjs.core.Corpus#text
		 * @instance
		 * @memberof nlpjs.core.Corpus
		 * @readonly
		 * @type {string}
		 */
		get : function() {
			var text = "";
			for (var i in this._documents)
				text += this._documents[i].text;
			return text;
		}
	});

	Object.defineProperty(Corpus.prototype, 'annotations', {
		/**
		 * Concated annotations of all documents in this corpus.
		 * AnnotationSet is reindexed to match concated text provided by
		 * {@link nlpjs.core.Corpus#text|text property}
		 *
		 * Please note that this property is not cached and new AnnotationSet
		 * is create with every access.
		 * @name nlpjs.core.Corpus#annotations
		 * @instance
		 * @memberof nlpjs.core.Corpus
		 * @type {nlpjs.core.AnnotationSet}
		 */
		get : function(){
			return this._annotations;
		}
	});

	return Corpus;
});
