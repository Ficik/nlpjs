import Annotation from './Annotation';

class AnnotationSet{

	/**
	 * Annotations set provides access to
	 * Document annotation
	 * @constructor
	 * @name nlpjs.core.AnnotationSet
	 * @param {object} [set] initial set of annotations
	 */
	constructor(document, set){
		this._document = document;
		var self = this;
		if (set === undefined){
			this._data = [];
		} else {
			this._data = set.map(function(x){
				if (x instanceof Annotation){
					return x;
				}
				return new Annotation(self, x.start, x.end, x.type, x.features);
			});
		}
		this._sort();
		this._listeners = {};
	}

	/**
	 * @function
	 * @name nlpjs.core.AnnotationSet:createAnnotation
	 */
	static createAnnotation(start, end, type, features){
		return new Annotation(undefined, start, end, type, features);
	}

	static cloneAnnotation(annotation){
		return annotation.clone();
	}

	/**
	 * Adds new annotation into set
	 * @method
	 * @name nlpjs.core.AnnotationSet#add
	 * @param {number} start index of start of the annotation
	 * @param {number} end      index of end of the annotation
	 * @param {string} type     type of annotation (html, pos, ie.)
	 * @param {object} features object containg featurs of annotation
	 * @returns {nlpjs.core.AnnotationSet} self for chaining
	 */

	/**
	 * Adds another AnnotationSet into this set
	 * @method
	 * @name nlpjs.core.AnnotationSet#add
	 * @param {AnnotationSet} start set to be concated into this set
	 * @returns {nlpjs.core.AnnotationSet} self for chaining
	 */
	add(start, end, type, features) {
		var annotation, i, ii;
		if (arguments.length > 1){
			annotation = AnnotationSet.createAnnotation(start, end, type, features);
		} else {
			annotation = start;
		}

		if (Object.prototype.toString.call(annotation) !== '[object Array]'){
			annotation = [annotation];
		}
		for(i = 0, ii = annotation.length;i<ii;i++){
			annotation[i]._set = this;
		}

		this._data = this._data.concat(annotation);
		this._sort();
		if (this._listeners.add) {
			for(i = 0, ii = this._listeners.add.length; i<ii;i++){
				this._listeners.add[i](annotation);
			}
		}
		return this;
	}

	del(annotations){
		if (Object.prototype.toString.call(annotations) !== '[object Array]'){
			annotations = [annotations];
		}
		this._data = this._data.filter(function(an){
			for (var i=0,ii=annotations.length;i<ii;i++){
				var annotation = annotations[i];
				if (annotation.type  === an.type &&
					  annotation.start === an.start &&
						annotation.end   === an.end)
						return false;
			}
			return true;
		});
		if (this._listeners.del) {
			for(var i = 0, ii = this._listeners.del.length; i<ii;i++){
				this._listeners.del[i](annotations);
			}
		}
		return this;
	}

	/**
	 * Filters annotations by type
	 * @method
	 * @name nlpjs.core.AnnotationSet#type
	 * @param  {string} type type of annotation
	 * @return {nlpjs.core.AnnotationSet} filtered set
	 */
	type(type) {
		return this.filter(function(annotation){
			return annotation.type === type;
		});
	}

	/**
	 * Returns annotations at least partially overlapping selection
	 * @method
	 * @name nlpjs.core.AnnotationSet#get
	 * @param  {number} startOffset index of start of selection
	 * @param  {number} endOffset   index of end of selection
	 * @return {nlpjs.core.AnnotationSet} filtered set
	 */
	/**
	 * Returns first annotation that starts at or after
	 * index and all other annotations
	 * that starts at index of found annotation
	 * @method
	 * @name nlpjs.core.AnnotationSet#get
	 * @param  {number} startOffset index
	 * @return {nlpjs.core.AnnotationSet} filtered set
	 */
	get(startOffset, endOffset) {
		var pred;
		if (endOffset !== undefined) {
			pred = function(annotation) {
				return annotation.start < endOffset && annotation.end > startOffset;
			};
		} else {
			pred = (function() {
				var max = Infinity;
				return function(annotation){
					if (annotation.start >= startOffset && annotation.start <= max){
						max = annotation.start;
						return true;
					}
					return false;
				};
			})();
		}
		return this.filter(pred);
	}

	/**
	 * @method
	 * @name nlpjs.core.AnnotationSet#filter
	 * @param  {function} pred filtering predicate
	 * @return {nlpjs.core.AnnotationSet} filtered set
	 */
	filter(pred) {
		return new AnnotationSet(this._document, this._data.filter(pred));
	}

	/**
	 * @method
	 * @name nlpjs.core.AnnotationSet#each
	 * @param  {function} fb callback (annotation and index is provided)
	 * @return {nlpjs.core.AnnotationSet} self for chaining
	 */
	each(fn) {
		for (var i = 0, ii = this._data.length; i < ii; i += 1){
			fn.call(fn, this._data[i], i);
		}
		return this;
	}

	map(fn){
		var arr = [];
		for (var i = 0, ii = this._data.length; i < ii; i += 1){
			arr.push(fn.call(fn, this._data[i], i));
		}
		return arr;
	}

	listen(type, callback) {
		this._listeners[type] = this._listeners[type] || [];
		this._listeners[type].push(callback);
	}

		/**
		 * First annotation of set
		 * @name first
		 * @memberof nlpjs.core.AnnotationSet
		 * @instance
		 * @readonly
		 * @type {object}
		 */
		get first() {
			return this._data[0];
		}


		/**
		 * last annotation of set
		 * @name last
		 * @memberof nlpjs.core.AnnotationSet
		 * @instance
		 * @readonly
		 * @type {object}
		 */
		get last() {
			return this._data[this.size-1];
		}

		/**
		 * Number of annotations in set
		 * @name size
		 * @memberof nlpjs.core.AnnotationSet
		 * @instance
		 * @readonly
		 * @type {number}
		 */
		get size() {
			return this._data.length;
		}

		/**
		 * Number of annotations in set
		 * @name length
		 * @memberof nlpjs.core.AnnotationSet
		 * @instance
		 * @readonly
		 * @type {number}
		 */
		get length() {
			return this.size;
		}

		/**
		 * Emptiness of set
		 * @name isEmpty
		 * @memberof nlpjs.core.AnnotationSet
		 * @instance
		 * @readonly
		 * @type {bool}
		 */
		get isEmpty() {
			return this.size === 0;
		}

	_sort(){
		this._data.sort(function(a, b){
			if (a.start < b.start)
				return -1;
			else if (a.start > b.start)
				return 1;
			else if (a.end < b.end)
				return -1;
			else if (a.end > b.end)
				return 1;
			else
				return 0;
		});
		return this;
	}

}


export default AnnotationSet;
