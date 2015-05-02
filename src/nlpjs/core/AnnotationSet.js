import Annotation from './Annotation';

/**
 * Annotations set provides access to
 * Document annotation
 * @class nlpjs.core.AnnotationSet
 * @property {number} size number of annotations in set
 * @property {nlpjs.core.Annotation} first first annotation in set
 * @property {nlpjs.core.Annotation} last  last annotation in set
 * @property {boolean} isEmpty emptiness of set
 * @param {nlpjs.core.Document} document document this annotation belongs to
 * @param {object} [set] initial set of annotations
 */
export default class AnnotationSet {


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
     * @method nlpjs.core.AnnotationSet#createAnnotation
     * @static
     */
    static createAnnotation(start, end, type, features){
        return new Annotation(undefined, start, end, type, features);
    }

    /**
     * @method nlpjs.core.AnnotationSet#cloneAnnotation
     * @static
     */
    static cloneAnnotation(annotation){
        return annotation.clone();
    }

    /**
     * Adds new annotation into set
     * @method nlpjs.core.AnnotationSet#add
     * @param {number} start index of start of the annotation
     * @param {number} end      index of end of the annotation
     * @param {string} type     type of annotation (html, pos, ie.)
     * @param {object} features object containing features of annotation
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

    /**
     * @method nlpjs.core.AnnotationSet#del
     * @param {Annotation|Array<Annotation>} annotations
     * @returns {AnnotationSet}
     */
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
     * @method nlpjs.core.AnnotationSet#type
     * @param  {string} type type of annotation
     * @returns {nlpjs.core.AnnotationSet} filtered set
     */
    type(type) {
        return this.filter(function(annotation){
            return annotation.type === type;
        });
    }

    /**
     * Returns annotations at least partially overlapping selection
     * @method nlpjs.core.AnnotationSet#get
     * @param  {number} startOffset index of start of selection
     * @param  {number} endOffset   index of end of selection
     * @return {nlpjs.core.AnnotationSet} filtered set
     */
    /**
     * Returns first annotation that starts at or after
     * index and all other annotations
     * that starts at index of found annotation
     * @method nlpjs.core.AnnotationSet#get
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
     * @method nlpjs.core.AnnotationSet#filter
     * @param  {function} pred filtering predicate
     * @return {nlpjs.core.AnnotationSet} filtered set
     */
    filter(pred) {
        return new AnnotationSet(this._document, this._data.filter(pred));
    }

    /**
     * @method nlpjs.core.AnnotationSet#each
     * @param  {function} fb callback (annotation and index is provided)
     * @return {nlpjs.core.AnnotationSet} self for chaining
     */
    each(fn) {
        for (var i = 0, ii = this._data.length; i < ii; i += 1){
            if (this._data[i].start >= 0 && this._data[i].end >= 0)
                fn.call(fn, this._data[i], i);
        }
        return this;
    }

    /**
     * @method nlpjs.core.AnnotationSet#map
     * @param fn
     * @returns {Array}
     */
    map(fn){
        var arr = [];
        for (var i = 0, ii = this._data.length; i < ii; i += 1){
            arr.push(fn.call(fn, this._data[i], i));
        }
        return arr;
    }

    /**
     * Subscribe to changes
     * @method nlpjs.core.AnnotationSet#listen
     * @param type
     * @param callback
     */
    listen(type, callback) {
        this._listeners[type] = this._listeners[type] || [];
        this._listeners[type].push(callback);
    }

    /**
     * @readOnly
     */
    get first() {
        return this._data[0];
    }

    /**
     * @readOnly
     */
    get last() {
        return this._data[this.size-1];
    }

    /**
     * @readOnly
     */
    get size() {
        return this._data.length;
    }


    /**
     * @readOnly
     */
    get length() {
        return this.size;
    }


    /**
     * @readOnly
     */
    get isEmpty() {
        return this.size === 0;
    }

    /**
     * @private
     * @name nlpjs.core.AnnotationSet#_sort
     */
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

