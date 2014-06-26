define(['klass/klass'], function(klass){
	/**
	 * Generic data container
	 * @constructor
	 * @name nlpjs.core.Container
	 * @param {string} name name of the container
	 */
	var Container = klass(function(name) {
	    this._name = name;
	})
	
	Object.defineProperty(Container.prototype, 'name', {
		/**
		 * Descriptive name of this Container
		 * @readonly
		 * @memberof nlpjs.core.Container 
		 * @name nlpjs.core.Container#name
		 * @type {string}
	 	*/
		get : function(){
			return this._name;
		}
	});

	return Container;
});