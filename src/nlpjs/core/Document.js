import AnnotationSet from './AnnotationSet';
import Container from './Container';

/**
 * Document
 * @class nlpjs.core.Document
 * @property {nlpjs.core.AnnotationSet} annotations Annotaions of this document
 * @property {string} text Plain text of this document
 * @property {number} size length of text
 * @param {string} name - human readable name of the document
 * @param {string} [text] - text of the document
 * @extends nlpjs.core.Container
 */
export default class Document extends Container {

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

    get size(){
        return this._text.length;
    }

    /**
     * Returns index of start of provided string, -1 otherwise
     * @method nlpjs.core.Document#indexOf
     * @param  {string} string string to be found
     * @return {number} position of string or -1 if not found
     */
    indexOf(string) {
        return this._text.indexOf(string);
    }

}
