import AnnotationSet from './AnnotationSet';
import Container from './Container';

export default class extends Container {

  /**
	 * Creates new document
	 * @constructor
	 * @param {string} name - human readable name of the document
	 * @extends nlpjs.core.Container
	 */
  constructor(name){
    super(name);
    this._text = '';
    this._annotationSet = new AnnotationSet(this);
  }

  /**
   * Human readable text of the document
   * @name text
   * @memberof nlpjs.core.Document
   * @instance
   * @type {string}
   */
  get text() {
    return this._text;
  }

  set text(text) {
    this._text = text.normalize();
    return this;
  }

  /**
  * Getter for annotations
  * @name annotations
  * @memberof nlpjs.core.Document
  * @instance
  * @readonly
  * @type {AnnotationSet}
  */
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
