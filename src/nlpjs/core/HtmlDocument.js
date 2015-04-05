import Document from './Document';
import AnnotationSet from './AnnotationSet.js';

export default class HtmlDocument extends Document {
    /**
     * Creates new document
     * @class nlpjs.core.HtmlDocument
     * @param {string} name - human readable name of the document
     * @extends nlpjs.core.Container
     */
    constructor(name){
        super(name);

        var entityMap = {
            '&nbsp;': ' ',
            '&amp;' : '&',
            '&lt;'  : '<',
            '&gt;'  : '>',
            '&quot;': '"',
            '&#x27;': "'"
        };

        this.unescape = (function() {
            var mapping = new RegExp('(' +Object.keys(entityMap).join('|')+')');
            return function(html) {
                return html.replace(mapping, function(entity) { return entityMap[entity]; });
            };
        })();
    }

    /**
     * @memberof nlpjs.core.HtmlDocument#text
     * @type {string}
     * @returns {string}
     */
    get text() {
        return this._text;
    }
    /**
     * Human readable text of the document
     *
     * html se to this property is parsed, html added to
     * annotations and just plaintext is left
     * @name nlpjs.core.HtmlDocument#text
     * @memberof nlpjs.core.HtmlDocument
     * @instance
     * @type {string}
     * @override
     */
    set text(text) {
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
                    var annotation = AnnotationSet.createAnnotation(position, position, 'html', attrSet);
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

    /**
     * Removes scripts, comments and unnessesary whitespaces
     * from document
     * @private
     * @method
     * @param {string} html html to be clean up
     * @return {string} cleaned up html
     * @name nlpjs.core.HtmlDocument#_cleanupHtml
     */
    _cleanupHtml(html) {
        return html.replace(/\n|\r/g, ' ')
            .replace(/<((?:script)|(?:style)).+?<\/\1>/gi, '') //remove scripts and style
            .replace(/<!--.+?-->/gi, '') //remove html comments
            .replace(/<!\[CDATA\[.+?\]\]>/gi, '') //remove CDATA
            .replace(/\s+/g,' ');
    }

}
