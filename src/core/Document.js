define(['nlpjs/core/AnnotationSet', 'nlpjs/core/Container'], function(AnnotationSet, Container){

	/**
	 * Creates new document
	 * @constructor
	 * @param {string} name - human readable name of the document
	 * @extends nlpjs.core.Container
	 */
    var Document = Container.extend(function(name) {
        this._text = '';
        this._annotationSet = new AnnotationSet(this);
    });

    //goog.inherits(nlpjs.core.Document, nlpjs.core.Container);

    (function(proto){

	    Object.defineProperty(proto, 'text', {
	    	/**
		     * Human readable text of the document
		     * @name text
		     * @memberof nlpjs.core.Document
		     * @instance
		     * @type {string}
		     */
	        get : function() {
	            return this._text;
	        },
	        set : function(text) {
	            this._text = text.normalize();;
	            return this;
	        }
	    });


	    Object.defineProperty(proto, 'annotations', {
	    	/**
		     * Getter for annotations
		     * @name annotations
		     * @memberof nlpjs.core.Document
		     * @instance
		     * @readonly
		     * @type {AnnotationSet}
		     */
	        get : function(){
	            return this._annotationSet;
	        }
	    });


	    Object.defineProperty(proto, 'size', {
	    	/**
		     * Getter for number of characters in document
		     * @name size
		     * @memberof nlpjs.core.Document
		     * @instance
		     * @readonly
		     * @type {number}
		     */
	        get : function(){
	            return this._text.length;
	        }
	    });

	    /**
	     * Returns index of start of provided string, -1 otherwise
	     * @method
	     * @name nlpjs.core.Document#indexOf
	     * @param  {string} string string to be found
	     * @return {number} position of string or -1 if not found
	     */
	    proto.indexOf = function(string) {
	    	return this._text.indexOf(string);
	    };
	})(Document.prototype);

	return Document;
});
