import AnnotationSet from './AnnotationSet';
import Container from './Container';

/**
 * @class nlpjs.core.Document
 * @property {nlpjs.core.AnnotationSet} annotations
 * @property {string} text
 * @property {number} size length of text
 */
export default class Document extends Container {

    /**
     * Creates new document
     * @constructor
     * @param {string} name - human readable name of the document
     * @param {string} [text] - text of the document
     * @extends nlpjs.core.Container
     */
    constructor(name, text){
        super(name);
        this._text = '';
        this._annotationSet = new AnnotationSet(this);
        if (text) {
            this.text = text;
        }
    }


    get text() {
        return this._text;
    }

    set text(text) {
        if (text.normalize){
            text = text.normalize();
        }
        this._text = text;
        return this;
    }

    get annotations(){
        return this._annotationSet;
    }

    /**
     * Getter for number of characters in document
     * @name size
     * @memberof nlpjs.core.Document
     * @instance
     * @readonly
     * @type {number}
     */
    get size(){
        return this._text.length;
    }

    /**
     * Returns index of start of provided string, -1 otherwise
     * @method
     * @name nlpjs.core.Document#indexOf
     * @param  {string} string string to be found
     * @return {number} position of string or -1 if not found
     */
    indexOf(string) {
        return this._text.indexOf(string);
    }

}
