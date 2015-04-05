export default class Annotation {

    /**
     * Document annotation
     * @class nlpjs.core.Annotation
     * @property {string} text
     * @param {AnnotationSet} set annotationset this annotation belongs to
     * @param {number} start start position before char
     * @param {number} end end position after char
     * @param {string} type type of annotation
     * @param {object} features set of features
     */
    constructor(set, start, end, type, features = {}){
        this._set = set;
        this.start = start;
        this.end   = end;
        this.type  = type;
        this.features = features;
    }

    /**
     * @memberof nlpjs.core.Annotation
     * @readOnly
     * @returns {string}
     */
    get text(){
        return this._set._document.text.slice(this.start, this.end);
    }

    /**
     * @method nlpjs.core.Annotation#next
     * @param {string|function(nlpjs.core.Annotation):boolean} type
     * @returns {nlpjs.core.Annotation|null}
     */
    next(type){
        if (typeof(type) == 'string')
            return this._set.type(type).get(this.end).first || null;
        else
            return this._set.filter(type).get(this.end).first || null;
    }

    /**
     * @method nlpjs.core.Annotation#containing
     * @param {string|function(nlpjs.core.Annotation):boolean} type
     * @returns {nlpjs.core.AnnotationSet}
     */
    containing(type){
        var set = this._set.get(this.start, this.end);
        if (typeof(type) == 'string')
            return set.type(type);
        else
            return set.filter(type);
    }

    /**
     *  @method nlpjs.core.Annotation#clone
     *  @returns {nlpjs.core.AnnotationSet}
     */
    clone(){
        return new Annotation(this, this.start, this.end, this.type, this.features);
    }

}
