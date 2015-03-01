define(['nlpjs/core/Document', 'nlpjs/core/AnnotationSet'],function(Document, AnnotationSet){
	/**
	 * @constructor
	 * @param {string} name
	 * @name nlpjs.core.HtmlDocument
	 * @extends nlpjs.core.Document
	 */
	var HtmlDocument = Document.extend(function(name) {
	});
	//goog.inherits(HtmlDocument, nlpjs.core.Document);

	Object.defineProperty(HtmlDocument.prototype, 'text', {

		get : function(text) {
			return this._text;
		},
		/**
	     * Human readable text of the document
	     *
	     * html se to this property is parsed, html added to
	     * annotations and just plaintext is left
	     * @name text
	     * @memberof nlpjs.core.Document
	     * @instance
	     * @type {string}
	     * @override
	     */
		set : function(text) {
			text = this._cleanupHtml(text);
			if (text.normalize)
				text.normalize();
			this._text = '';
			var matches = text.match(/(<\/?[^>]+>)|([^<]+)/gi);
			var position = 0;
			var tagStack = [];
			var annotations = [];
			var attrSet;
			var unpair = {
				br : true,
				img :true
			};
			var attributeMatcher = function(attr){
				attr = attr.match(/(\w+|-)(?:(?:=(["']?)(\S+)\2))?/);
				attrSet[attr[1]] = attr[3]||attr[1];
			};
			for (var i in matches){
				var match = matches[i];
				if (match[0] === '<'){ // it's a tag
					var parts = match.match(/<\/?(\S+)\s?(.*)>/);
					var tagname = parts[1];
					var attrs = parts[2];
					position = this._text.length;
					if (match[1] === '/') { // close
						var popped = tagStack.pop();
						while(popped !== undefined) {
							popped.end = position;
							annotations.push(popped);
							if(popped.features.element == tagname)
								break;
							popped = tagStack.pop();
						}
					} else { // open
						attrSet = {
							element : tagname
						};
						attrs.replace(/(\w|-)+(?:=(\S+))?/g, attributeMatcher);
						var annotation = AnnotationSet.createAnnotation(position, position, 'html', attrSet)
						if(unpair[tagname]){ // it's not pair element, close immediately
							annotations.push(annotation);
						} else {
							tagStack.push(annotation);
						}
					}
				} else { // it's not a tag
					this._text += this.unescape(match);
				}
			}
			this.annotations.add(annotations);
		}
	});

	/**
	 * Removes scripts, comments and unnessesary whitespaces
	 * from document
	 * @private
	 * @method
	 * @param {string} html html to be clean up
	 * @return {string} cleaned up html
	 * @name nlpjs.core.HtmlDocument#_cleanupHtml
	 */
	HtmlDocument.prototype._cleanupHtml = function(html) {
		return html.replace(/\n|\r/g, ' ')
				.replace(/<((?:script)|(?:style)).+?<\/\1>/gi, '') //remove scripts and style
				.replace(/<!--.+?-->/gi, '') //remove html comments
				.replace(/<!\[CDATA\[.+?\]\]>/gi, '') //remove CDATA
				.replace(/\s+/g,' ');
	};

	HtmlDocument.prototype.entityMap = {
		'&nbsp;': ' ',
		'&amp;' : '&',
		'&lt;'  : '<',
		'&gt;'  : '>',
		'&quot;': '"',
		'&#x27;': "'"
	};

	HtmlDocument.prototype.unescape = (function() {
		var mapping = new RegExp('('+Object.keys(HtmlDocument.prototype.entityMap).join('|')+')')
		return function(html) {
			return html.replace(mapping, function(entity) { return HtmlDocument.prototype.entityMap[entity]; });
		};
	})();

	return HtmlDocument;
});
