export default class Annotation {

    /**
     * Document annotation
     * @constructor
     * @name nlpjs.core.Annotation
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

    get text(){
        return this._set._document.text.slice(this.start, this.end);
    }

    next(type){
        if (typeof(type) == 'string')
            return this._set.type(type).get(this.end).first || null;
        else
            return this._set.filter(type).get(this.end).first || null;
    }

    containing(type){
        var set = this._set.get(this.start, this.end);
        if (typeof(type) == 'string')
            return set.type(type);
        else
            return set.filter(type);
    }

    clone(){
        return new Annotation(this, this.start, this.end, this.type, this.features);
    }

}
