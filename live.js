(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _Document = require('../src/nlpjs/core/Document');

var _Document2 = _interopRequireDefault(_Document);

var _Tokenizer = require('../src/nlpjs/tokenizer/Tokenizer');

var _Tokenizer2 = _interopRequireDefault(_Tokenizer);

var _NGram = require('../src/nlpjs/classifier/ngram');

var _NGram2 = _interopRequireDefault(_NGram);

var _Levenshtein = require('../src/nlpjs/distance/levenshtein');

var _Levenshtein2 = _interopRequireDefault(_Levenshtein);

var _EnStemmer = require('../src/nlpjs/extras/stemmer/en');

var _EnStemmer2 = _interopRequireDefault(_EnStemmer);

var input = document.getElementById('demoArea');
var result = document.getElementById('result');

var render = function render(document, ngrams, mostSimilar) {
    if (document.text.trim() === '') {
        result.innerHTML = '';
    }
    result.innerHTML = '\n    <dl>\n        <dd>Number of words</dd>\n        <dt>' + document.annotations.type('word').length + '</dt>\n        <dd>Sentences</dd>\n        <dt>' + document.annotations.type('sentence').length + '</dt>\n        <dd>Stem of the last word</dd>\n        <dt>' + document.annotations.type('word').last.features.stem + '</dt>\n        <dd>Most frequent trigrams</dd>\n        <dt>' + ngrams.join(', ') + '</dt>\n        <dd>Most similar words</dd>\n        <dt>' + mostSimilar.join(', ') + '</dt>\n    </dl>\n    ';
};

var tokenizer = new _Tokenizer2['default']();
var stemmer = new _EnStemmer2['default']();

var mostSimilarWords = function mostSimilarWords(words) {
    var best = Infinity;
    var mostSimilar;
    for (var i = 0, ii = words.length; i < ii; i++) {
        var word = words[i];
        for (var j = i + 1, jj = words.length; j < jj; j++) {
            var distance = _Levenshtein2['default'].distance(word, words[j]);
            if (distance > 0 && distance < best) {
                best = distance;
                mostSimilar = [word, words[j]];
            }
        }
    }
    return mostSimilar || ['type more unique words'];
};

input.addEventListener('input', function (event) {
    var document = new _Document2['default']();
    document.text = input.value || '';
    tokenizer.tokenize(document);
    stemmer.stemDocument(document);
    var ngrams = _NGram2['default'].ranked(_NGram2['default'].compute(document.text, 3, 3)).slice(0, 3);
    var words = document.annotations.type('word').map(function (annotation) {
        return annotation.text;
    });
    render(document, ngrams, mostSimilarWords(words));
});

},{"../src/nlpjs/classifier/ngram":2,"../src/nlpjs/core/Document":6,"../src/nlpjs/distance/levenshtein":7,"../src/nlpjs/extras/stemmer/en":9,"../src/nlpjs/tokenizer/Tokenizer":14}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var NGram = (function () {

    /**
     * N-gram frequency analysis
     * @class nlpjs.classifier.NGram
     * @property {object} model
     * @param {Object.<string,Array>} model
     * @param {number} n
     * @param {number} m
     * @param {number} [top]
     */

    function NGram(model, n, m) {
        var top = arguments[3] === undefined ? Infinity : arguments[3];

        _classCallCheck(this, NGram);

        this.model = model;
        this.n = n;
        this.m = m;
        this.top = top;
        var label;
        for (label in this.model) {
            if (this.model.hasOwnProperty(label)) {
                this.top = Math.min(this.top, this.model[label].length);
            }
        }
        for (label in this.model) {
            if (this.model.hasOwnProperty(label)) {
                this.model[label].splice(this.top, Infinity);
            }
        }
    }

    _createClass(NGram, [{
        key: 'classify',

        /**
         * Classify text
         * @method nlpjs.classifier.NGram#classify
         * @param {string} text
         * @param {number} [threshold]
         * @returns {string} label of class
         */
        value: function classify(text) {
            var threshold = arguments[1] === undefined ? Infinity : arguments[1];

            var scores = this.scores(text);
            var min = Infinity;
            var minLabel = null;
            for (var label in scores) {
                if (scores.hasOwnProperty(label)) {
                    if (scores[label] < min && scores[label] / this.top < threshold) {
                        min = scores[label];
                        minLabel = label;
                    }
                }
            }
            return minLabel;
        }
    }, {
        key: 'scores',

        /**
         * @method nlpjs.classifier.NGram#scores
         * @param {string} text text to calculate score from
         * @returns {{}}
         */
        value: function scores(text) {
            var sample = NGram.ranked(NGram.compute(text, this.n, this.m)).splice(0, this.top);
            var scores = {};
            for (var label in this.model) {
                if (this.model.hasOwnProperty(label)) {
                    var model = this.model[label];
                    scores[label] = NGram.distance(model, sample);
                }
            }
            return scores;
        }
    }, {
        key: 'toJSON',

        /**
         * Serialized model to json
         * @method nlpjs.classifier.NGram#toJSON
         * @retuns {string} json
         */
        value: function toJSON() {
            var serialized = {
                n: this.n,
                m: this.m,
                top: this.top,
                model: {}
            };

            for (var label in this.model) {
                if (this.model.hasOwnProperty(label)) {
                    serialized.model[label] = this.model[label].join('|');
                }
            }

            return JSON.stringify(serialized);
        }
    }], [{
        key: 'fromJSON',

        /**
         * Deserialize model from json
         * @method nlpjs.classifier.NGram.fromJSON
         * @param {string} json
         */
        value: function fromJSON(json) {
            json = JSON.parse(json);
            for (var label in json.model) {
                if (json.model.hasOwnProperty(label)) {
                    json.model[label] = json.model[label].split('|');
                }
            }
            return new NGram(json.model, json.n, json.m, json.top);
        }
    }, {
        key: 'fromText',

        /**
         * @method nlpjs.classifier.NGram.fromText
         * @static
         * @param models
         * @param n
         * @param m
         * @param top
         */
        value: function fromText(models, n, m, top) {
            var model = {};
            for (var label in models) {
                if (models.hasOwnProperty(label)) {
                    model[label] = NGram.ranked(NGram.compute(models[label], n, m));
                }
            }
            return new NGram(model, n, m, top);
        }
    }, {
        key: 'ranked',

        /**
         * @method nlpjs.classifier.NGram.ranked
         * @param model
         * @returns {Array}
         */
        value: function ranked(model) {
            var list = NGram.stats(model);
            list.sort(function (a, b) {
                return a.c > b.c ? -1 : a.c < b.c ? 1 : a.w < b.w ? -1 : 1;
            });
            return list.map(function (x) {
                return x.w;
            });
        }
    }, {
        key: 'distance',

        /**
         * @method nlpjs.classifier.NGram.distance
         * @param a
         * @param b
         * @returns {number}
         */
        value: function distance(a, b) {
            var size = a.length;
            var j;
            var distance = 0;
            for (var i = 0, ii = size; i < ii; i++) {
                j = b.indexOf(a[i]);
                if (j == -1) {
                    distance += size;
                } else {
                    distance += Math.abs(i - j);
                }
            }
            return distance;
        }
    }, {
        key: 'compute',

        /**
         * N-gram frequency analysis
         * @method nlpjs.classifier.NGram.compute
         * @param  {string} input text to be analysed
         * @param  {number} n smallest ngram size
         * @param  {number} [m] larges ngram size, if not provided equals to n
         * @return {object}   ngram frequencies
         * @example Ngram.compute(text, 1) // returns letters frequencies
         *  Ngram.compute(text, 2,3) // returns bi-grams and tri-grams
         */
        value: function compute(input, n, m) {
            if (m === undefined) m = n;

            var dict = {},
                buffer = [],
                word,
                i = 0,
                text = ('_' + input + '_').replace(/(\s|[.,!?])+/g, '_') // replace punctuation with _
            .replace(/_+/, '_').replace(/[0-9()°|><-]/g, '') // remove
            .toLowerCase().split('');

            for (; n <= m; n++) {
                buffer = [];
                for (i = 0; i < text.length; i++) {
                    buffer.push(text[i]);
                    if (buffer.length == n) {
                        word = buffer.join('');
                        if (word !== '_') {
                            dict[word] = (dict[word] || 0) + 1;
                        }
                        buffer.shift();
                    }
                }
            }
            return dict;
        }
    }, {
        key: 'stats',

        /**
         * N-gram frequency analysis with
         * frequency statistics, counts and rank
         * @method nlpjs.classifier.NGram.stats
         * @return {Object[]} with keys f, w, r, c
         */
        value: function stats(ngrams) {
            var arr = [];
            for (var ngram in ngrams) {
                if (ngrams.hasOwnProperty(ngram)) {
                    arr.push({
                        c: ngrams[ngram],
                        w: ngram
                    });
                }
            }

            var totalCount = arr.reduce(function (sum, ngram) {
                return sum + ngram.c;
            }, 0);
            if (totalCount < 1) totalCount = 1;

            for (var i = 0; i < arr.length; i++) {
                arr[i].f = arr[i].c / totalCount;
                arr[i].r = i;
            }
            return arr;
        }
    }, {
        key: 'compare',
        value: function compare(text, top, n, m) {
            var thisNgrams = NGram.stats.apply(this, [text, n, m]).slice(0, top);
            console.log(thisNgrams);
            var self = this;
            return function () {
                return Array.prototype.slice.call(arguments, 0).map(function (ngrams) {
                    var reverseIndex = {};

                    ngrams = ngrams.slice(0, top);
                    for (var i = 0; i < ngrams.length; i += 1) {
                        reverseIndex[ngrams[i].w] = ngrams[i];
                    }
                    return self._ngramScore(thisNgrams, reverseIndex);
                });
            };
        }
    }, {
        key: '_ngramScore',
        value: function _ngramScore(ngrams, reverseIndex) {
            var distance = 0;
            var max = Object.keys(reverseIndex).length;
            var penalties = [];
            for (var i = 0; i < ngrams.length; i += 1) {
                var gram = ngrams[i];
                var model = reverseIndex[gram.w];
                var penalty = model === undefined ? max : Math.abs(gram.r - model.r);
                penalties.push(penalty);
                distance += penalty;
            }
            return distance / ngrams.length;
        }
    }, {
        key: 'save',

        /**
         * Saves model into json
         * @param data
         * @param top
         * @returns {*}
         * @deprecated use toJson
         */
        value: function save(data, top) {
            top = top || 300;
            var exp = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    exp[key] = data[key].slice(0, top).map(function (x) {
                        return x.w;
                    }).join('|');
                }
            }
            return JSON.stringify(exp);
        }
    }, {
        key: 'load',

        /**
         * Loads model from json
         * @param json
         * @returns {{}}
         * @deprecated use NGram.fromJSON
         */
        value: function load(json) {
            var exp = {};
            var data = typeof json === 'string' ? JSON.parse(json) : json;
            for (var key in data) {
                if (data.hasOwnProperty(key)) exp[key] = data[key].split('|').map(function (x, i) {
                    return { w: x, r: i };
                });
            }
            return exp;
        }
    }, {
        key: 'importUrl',
        value: function importUrl(url) {
            return http.get(url).then(function (x) {
                return NGram['import'](x);
            });
        }
    }]);

    return NGram;
})();

exports['default'] = NGram;
module.exports = exports['default'];

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

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

var Annotation = (function () {
    function Annotation(set, start, end, type) {
        var features = arguments[4] === undefined ? {} : arguments[4];

        _classCallCheck(this, Annotation);

        this._set = set;
        this.start = start;
        this.end = end;
        this.type = type;
        this.features = features;
    }

    _createClass(Annotation, [{
        key: 'text',

        /**
         * @memberof nlpjs.core.Annotation
         * @readOnly
         * @returns {string}
         */
        get: function () {
            return this._set._document.text.slice(this.start, this.end);
        }
    }, {
        key: 'next',

        /**
         * @method nlpjs.core.Annotation#next
         * @param {string|function(nlpjs.core.Annotation):boolean} type
         * @returns {nlpjs.core.Annotation|null}
         */
        value: function next(type) {
            if (typeof type == 'string') {
                return this._set.type(type).get(this.end).first || null;
            } else {
                return this._set.filter(type).get(this.end).first || null;
            }
        }
    }, {
        key: 'containing',

        /**
         * @method nlpjs.core.Annotation#containing
         * @param {string|function(nlpjs.core.Annotation):boolean} type
         * @returns {nlpjs.core.AnnotationSet}
         */
        value: function containing(type) {
            var set = this._set.get(this.start, this.end);
            if (typeof type == 'string') {
                return set.type(type);
            } else {
                return set.filter(type);
            }
        }
    }, {
        key: 'clone',

        /**
         *  @method nlpjs.core.Annotation#clone
         *  @returns {nlpjs.core.AnnotationSet}
         */
        value: function clone() {
            return new Annotation(this, this.start, this.end, this.type, this.features);
        }
    }]);

    return Annotation;
})();

exports['default'] = Annotation;
module.exports = exports['default'];

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _Annotation = require('./Annotation');

var _Annotation2 = _interopRequireDefault(_Annotation);

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

var AnnotationSet = (function () {
    function AnnotationSet(document, set) {
        _classCallCheck(this, AnnotationSet);

        this._document = document;
        var self = this;
        if (set === undefined) {
            this._data = [];
        } else {
            this._data = set.map(function (x) {
                if (x instanceof _Annotation2['default']) {
                    return x;
                }
                return new _Annotation2['default'](self, x.start, x.end, x.type, x.features);
            });
        }
        this._sort();
        this._listeners = {};
    }

    _createClass(AnnotationSet, [{
        key: 'add',

        /**
         * Adds new annotation into set
         * @method nlpjs.core.AnnotationSet#add
         * @param {number} start index of start of the annotation
         * @param {number} end      index of end of the annotation
         * @param {string} type     type of annotation (html, pos, ie.)
         * @param {object} features object containing features of annotation
         * @returns {nlpjs.core.AnnotationSet} self for chaining
         */
        value: function add(start, end, type, features) {
            var annotation, i, ii;
            if (arguments.length > 1) {
                annotation = AnnotationSet.createAnnotation(start, end, type, features);
            } else {
                annotation = start;
            }

            if (Object.prototype.toString.call(annotation) !== '[object Array]') {
                annotation = [annotation];
            }
            for (i = 0, ii = annotation.length; i < ii; i++) {
                annotation[i]._set = this;
            }

            this._data = this._data.concat(annotation);
            this._sort();
            if (this._listeners.add) {
                for (i = 0, ii = this._listeners.add.length; i < ii; i++) {
                    this._listeners.add[i](annotation);
                }
            }
            return this;
        }
    }, {
        key: 'del',

        /**
         * @method nlpjs.core.AnnotationSet#del
         * @param {Annotation|Array<Annotation>} annotations
         * @returns {AnnotationSet}
         */
        value: function del(annotations) {
            if (Object.prototype.toString.call(annotations) !== '[object Array]') {
                annotations = [annotations];
            }
            this._data = this._data.filter(function (an) {
                for (var i = 0, ii = annotations.length; i < ii; i++) {
                    var annotation = annotations[i];
                    if (annotation.type === an.type && annotation.start === an.start && annotation.end === an.end) return false;
                }
                return true;
            });
            if (this._listeners.del) {
                for (var i = 0, ii = this._listeners.del.length; i < ii; i++) {
                    this._listeners.del[i](annotations);
                }
            }
            return this;
        }
    }, {
        key: 'type',

        /**
         * Filters annotations by type
         * @method nlpjs.core.AnnotationSet#type
         * @param  {string} type type of annotation
         * @returns {nlpjs.core.AnnotationSet} filtered set
         */
        value: function type(type) {
            return this.filter(function (annotation) {
                return annotation.type === type;
            });
        }
    }, {
        key: 'get',

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
        value: function get(startOffset, endOffset) {
            var pred;
            if (endOffset !== undefined) {
                pred = function (annotation) {
                    return annotation.start < endOffset && annotation.end > startOffset;
                };
            } else {
                pred = (function () {
                    var max = Infinity;
                    return function (annotation) {
                        if (annotation.start >= startOffset && annotation.start <= max) {
                            max = annotation.start;
                            return true;
                        }
                        return false;
                    };
                })();
            }
            return this.filter(pred);
        }
    }, {
        key: 'filter',

        /**
         * @method nlpjs.core.AnnotationSet#filter
         * @param  {function} pred filtering predicate
         * @return {nlpjs.core.AnnotationSet} filtered set
         */
        value: function filter(pred) {
            return new AnnotationSet(this._document, this._data.filter(pred));
        }
    }, {
        key: 'each',

        /**
         * @method nlpjs.core.AnnotationSet#each
         * @param  {function} fb callback (annotation and index is provided)
         * @return {nlpjs.core.AnnotationSet} self for chaining
         */
        value: function each(fn) {
            for (var i = 0, ii = this._data.length; i < ii; i += 1) {
                if (this._data[i].start >= 0 && this._data[i].end >= 0) fn.call(fn, this._data[i], i);
            }
            return this;
        }
    }, {
        key: 'map',

        /**
         * @method nlpjs.core.AnnotationSet#map
         * @param fn
         * @returns {Array}
         */
        value: function map(fn) {
            var arr = [];
            for (var i = 0, ii = this._data.length; i < ii; i += 1) {
                arr.push(fn.call(fn, this._data[i], i));
            }
            return arr;
        }
    }, {
        key: 'listen',

        /**
         * Subscribe to changes
         * @method nlpjs.core.AnnotationSet#listen
         * @param type
         * @param callback
         */
        value: function listen(type, callback) {
            this._listeners[type] = this._listeners[type] || [];
            this._listeners[type].push(callback);
        }
    }, {
        key: 'first',

        /**
         * @readOnly
         */
        get: function () {
            return this._data[0];
        }
    }, {
        key: 'last',

        /**
         * @readOnly
         */
        get: function () {
            return this._data[this.size - 1];
        }
    }, {
        key: 'size',

        /**
         * @readOnly
         */
        get: function () {
            return this._data.length;
        }
    }, {
        key: 'length',

        /**
         * @readOnly
         */
        get: function () {
            return this.size;
        }
    }, {
        key: 'isEmpty',

        /**
         * @readOnly
         */
        get: function () {
            return this.size === 0;
        }
    }, {
        key: '_sort',

        /**
         * @private
         * @name nlpjs.core.AnnotationSet#_sort
         */
        value: function _sort() {
            this._data.sort(function (a, b) {
                if (a.start < b.start) return -1;else if (a.start > b.start) return 1;else if (a.end < b.end) return -1;else if (a.end > b.end) return 1;else return 0;
            });
            return this;
        }
    }], [{
        key: 'createAnnotation',

        /**
         * @method nlpjs.core.AnnotationSet#createAnnotation
         * @static
         */
        value: function createAnnotation(start, end, type, features) {
            return new _Annotation2['default'](undefined, start, end, type, features);
        }
    }, {
        key: 'cloneAnnotation',

        /**
         * @method nlpjs.core.AnnotationSet#cloneAnnotation
         * @static
         */
        value: function cloneAnnotation(annotation) {
            return annotation.clone();
        }
    }]);

    return AnnotationSet;
})();

exports['default'] = AnnotationSet;
module.exports = exports['default'];

},{"./Annotation":3}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var Container = (function () {

    /**
     * Generic data container
     * @class nlpjs.core.Container
     * @param {string} name name of the container
     * @property {string} name
     */

    function Container(name) {
        _classCallCheck(this, Container);

        this._name = name;
    }

    _createClass(Container, [{
        key: "name",

        /**
         * @readonly
         * @returns {Container.name}
         */
        get: function () {
            return this._name;
        }
    }]);

    return Container;
})();

exports["default"] = Container;
module.exports = exports["default"];

},{}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _AnnotationSet = require('./AnnotationSet');

var _AnnotationSet2 = _interopRequireDefault(_AnnotationSet);

var _Container2 = require('./Container');

var _Container3 = _interopRequireDefault(_Container2);

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

var Document = (function (_Container) {
    function Document(name, text) {
        _classCallCheck(this, Document);

        _get(Object.getPrototypeOf(Document.prototype), 'constructor', this).call(this, name);
        this._text = '';
        this._annotationSet = new _AnnotationSet2['default'](this);
        if (text) {
            this.text = text;
        }
    }

    _inherits(Document, _Container);

    _createClass(Document, [{
        key: 'text',
        get: function () {
            return this._text;
        },
        set: function (text) {
            if (text.normalize) {
                text = text.normalize();
            }
            this._text = text;
            return this;
        }
    }, {
        key: 'annotations',
        get: function () {
            return this._annotationSet;
        }
    }, {
        key: 'size',
        get: function () {
            return this._text.length;
        }
    }, {
        key: 'indexOf',

        /**
         * Returns index of start of provided string, -1 otherwise
         * @method nlpjs.core.Document#indexOf
         * @param  {string} string string to be found
         * @return {number} position of string or -1 if not found
         */
        value: function indexOf(string) {
            return this._text.indexOf(string);
        }
    }]);

    return Document;
})(_Container3['default']);

exports['default'] = Document;
module.exports = exports['default'];

},{"./AnnotationSet":4,"./Container":5}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */

/**
 *  @class Levenshtein
 *  @memberOf nlpjs.distance
 *  @property {number} add cost of character insertion
 *  @property {number} del cost of character removal
 *  @property {number} edit cost of character substitution
 *  @param {number} add cost of character insertion
 *  @param {number} del cost of character removal
 *  @param {number} edit cost of character substitution
 *  @describe weighted Levenshtein/edit distance
 *  Default weights are all eq to 1
 *  @example // Static with default costs
 *  Levenshtein.distance('hello', 'hello world')
 *  // => 6
 *  @example // Instance with custom costs
 *  var levenshtein = new Levenshtein(2,1,1) // insertion, removal, substitution costs
 *  levenshtein.distance('hello', 'hello world')
 *  // => 12
 */

var Levenshtein = (function () {
    function Levenshtein() {
        var add = arguments[0] === undefined ? 1 : arguments[0];
        var del = arguments[1] === undefined ? 1 : arguments[1];
        var edit = arguments[2] === undefined ? 1 : arguments[2];

        _classCallCheck(this, Levenshtein);

        this.add = add;
        this.del = del;
        this.edit = edit;
    }

    _createClass(Levenshtein, [{
        key: "distance",

        /**
         * Computes Levenshtein distance of two strings
         * @method nlpjs.distance.Levenshtein#distance
         * @param {string} string1
         * @param {string} string2
         * @returns {number}
         */
        value: function distance(string1, string2) {
            var _this = this;

            string1 = string1.toString();
            string2 = string2.toString();

            if (string1 == string2) {
                // string looks same
                return 0;
            }
            if (string1.length === 0) {
                return string2.length * this.add;
            }

            if (string2.length === 0) {
                return string1.length * this.del;
            }

            var vec1 = Array.apply(null, new Array(string2.length + 1)).map(function (x, i) {
                return i * _this.del;
            }),
                vec2 = [];

            for (var i = 0, ii = string1.length; i < ii; i += 1) {
                vec2[0] = (i + 1) * this.add;

                for (var j = 0, jj = string2.length; j < jj; j += 1) {
                    var cost = string1[i] === string2[j] ? 0 : this.edit;
                    vec2[j + 1] = Math.min(vec2[j] + this.del, vec1[j + 1] + this.add, vec1[j] + cost);
                }

                vec1 = vec2;
                vec2 = [];
            }

            return vec1[string2.length];
        }
    }], [{
        key: "distance",

        /**
         * Computes Levenshtein distance of two strings with default weights
         * @method nlpjs.distance.Levenshtein.distance
         * @param {string} string1
         * @param {string} string2
         * @static
         * @returns {number}
         */
        value: function distance(string1, string2) {
            return new Levenshtein().distance(string1, string2);
        }
    }]);

    return Levenshtein;
})();

exports["default"] = Levenshtein;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * @abstract
 * @class nlpjs.extras.Stemmer
 */

var Stemmer = (function () {
    function Stemmer(language) {
        _classCallCheck(this, Stemmer);

        this._language = language;
    }

    _createClass(Stemmer, [{
        key: 'language',
        get: function () {
            return this._language;
        }
    }, {
        key: 'stemDocument',
        value: function stemDocument(document) {
            var type = arguments[1] === undefined ? 'word' : arguments[1];

            var self = this;
            var text = document.text;
            var words = document.annotations.type(type);
            words.each(function (word) {
                var w = text.slice(word.start, word.end);
                word.features.stem = self.stem(w);
            });
        }
    }]);

    return Stemmer;
})();

exports['default'] = Stemmer;
module.exports = exports['default'];

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { desc = parent = getter = undefined; _again = false; var object = _x,
    property = _x2,
    receiver = _x3; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _SnowballProgram = require('../../helpers/snowball');

var _SnowballProgram2 = _interopRequireDefault(_SnowballProgram);

var _Among = require('../../helpers/among');

var _Among2 = _interopRequireDefault(_Among);

var _Stemmer2 = require('../Stemmer');

var _Stemmer3 = _interopRequireDefault(_Stemmer2);

/*!
* Snowball JavaScript Library v0.3
* http://code.google.com/p/urim/
* http://snowball.tartarus.org/
*
* Copyright 2010, Oleg Mazko
* http://www.mozilla.org/MPL/
*/
/* jshint ignore:start */

function EnglishStemmer() {
    var a_0 = [new _Among2['default']('arsen', -1, -1), new _Among2['default']('commun', -1, -1), new _Among2['default']('gener', -1, -1)],
        a_1 = [new _Among2['default']('\'', -1, 1), new _Among2['default']('\'s\'', 0, 1), new _Among2['default']('\'s', -1, 1)],
        a_2 = [new _Among2['default']('ied', -1, 2), new _Among2['default']('s', -1, 3), new _Among2['default']('ies', 1, 2), new _Among2['default']('sses', 1, 1), new _Among2['default']('ss', 1, -1), new _Among2['default']('us', 1, -1)],
        a_3 = [new _Among2['default']('', -1, 3), new _Among2['default']('bb', 0, 2), new _Among2['default']('dd', 0, 2), new _Among2['default']('ff', 0, 2), new _Among2['default']('gg', 0, 2), new _Among2['default']('bl', 0, 1), new _Among2['default']('mm', 0, 2), new _Among2['default']('nn', 0, 2), new _Among2['default']('pp', 0, 2), new _Among2['default']('rr', 0, 2), new _Among2['default']('at', 0, 1), new _Among2['default']('tt', 0, 2), new _Among2['default']('iz', 0, 1)],
        a_4 = [new _Among2['default']('ed', -1, 2), new _Among2['default']('eed', 0, 1), new _Among2['default']('ing', -1, 2), new _Among2['default']('edly', -1, 2), new _Among2['default']('eedly', 3, 1), new _Among2['default']('ingly', -1, 2)],
        a_5 = [new _Among2['default']('anci', -1, 3), new _Among2['default']('enci', -1, 2), new _Among2['default']('ogi', -1, 13), new _Among2['default']('li', -1, 16), new _Among2['default']('bli', 3, 12), new _Among2['default']('abli', 4, 4), new _Among2['default']('alli', 3, 8), new _Among2['default']('fulli', 3, 14), new _Among2['default']('lessli', 3, 15), new _Among2['default']('ousli', 3, 10), new _Among2['default']('entli', 3, 5), new _Among2['default']('aliti', -1, 8), new _Among2['default']('biliti', -1, 12), new _Among2['default']('iviti', -1, 11), new _Among2['default']('tional', -1, 1), new _Among2['default']('ational', 14, 7), new _Among2['default']('alism', -1, 8), new _Among2['default']('ation', -1, 7), new _Among2['default']('ization', 17, 6), new _Among2['default']('izer', -1, 6), new _Among2['default']('ator', -1, 7), new _Among2['default']('iveness', -1, 11), new _Among2['default']('fulness', -1, 9), new _Among2['default']('ousness', -1, 10)],
        a_6 = [new _Among2['default']('icate', -1, 4), new _Among2['default']('ative', -1, 6), new _Among2['default']('alize', -1, 3), new _Among2['default']('iciti', -1, 4), new _Among2['default']('ical', -1, 4), new _Among2['default']('tional', -1, 1), new _Among2['default']('ational', 5, 2), new _Among2['default']('ful', -1, 5), new _Among2['default']('ness', -1, 5)],
        a_7 = [new _Among2['default']('ic', -1, 1), new _Among2['default']('ance', -1, 1), new _Among2['default']('ence', -1, 1), new _Among2['default']('able', -1, 1), new _Among2['default']('ible', -1, 1), new _Among2['default']('ate', -1, 1), new _Among2['default']('ive', -1, 1), new _Among2['default']('ize', -1, 1), new _Among2['default']('iti', -1, 1), new _Among2['default']('al', -1, 1), new _Among2['default']('ism', -1, 1), new _Among2['default']('ion', -1, 2), new _Among2['default']('er', -1, 1), new _Among2['default']('ous', -1, 1), new _Among2['default']('ant', -1, 1), new _Among2['default']('ent', -1, 1), new _Among2['default']('ment', 15, 1), new _Among2['default']('ement', 16, 1)],
        a_8 = [new _Among2['default']('e', -1, 1), new _Among2['default']('l', -1, 2)],
        a_9 = [new _Among2['default']('succeed', -1, -1), new _Among2['default']('proceed', -1, -1), new _Among2['default']('exceed', -1, -1), new _Among2['default']('canning', -1, -1), new _Among2['default']('inning', -1, -1), new _Among2['default']('earring', -1, -1), new _Among2['default']('herring', -1, -1), new _Among2['default']('outing', -1, -1)],
        a_10 = [new _Among2['default']('andes', -1, -1), new _Among2['default']('atlas', -1, -1), new _Among2['default']('bias', -1, -1), new _Among2['default']('cosmos', -1, -1), new _Among2['default']('dying', -1, 3), new _Among2['default']('early', -1, 9), new _Among2['default']('gently', -1, 7), new _Among2['default']('howe', -1, -1), new _Among2['default']('idly', -1, 6), new _Among2['default']('lying', -1, 4), new _Among2['default']('news', -1, -1), new _Among2['default']('only', -1, 10), new _Among2['default']('singly', -1, 11), new _Among2['default']('skies', -1, 2), new _Among2['default']('skis', -1, 1), new _Among2['default']('sky', -1, -1), new _Among2['default']('tying', -1, 5), new _Among2['default']('ugly', -1, 8)],
        g_v = [17, 65, 16, 1],
        g_v_WXY = [1, 17, 65, 208, 1],
        g_valid_LI = [55, 141, 2],
        B_Y_found,
        I_p2,
        I_p1,
        habr = [r_Step_1b, r_Step_1c, r_Step_2, r_Step_3, r_Step_4, r_Step_5],
        sbp = new _SnowballProgram2['default']();
    this.setCurrent = function (word) {
        sbp.setCurrent(word);
    };
    this.getCurrent = function () {
        return sbp.getCurrent();
    };
    function r_prelude() {
        var v_1 = sbp.cursor,
            v_2;
        B_Y_found = false;
        sbp.bra = sbp.cursor;
        if (sbp.eq_s(1, '\'')) {
            sbp.ket = sbp.cursor;
            sbp.slice_del();
        }
        sbp.cursor = v_1;
        sbp.bra = v_1;
        if (sbp.eq_s(1, 'y')) {
            sbp.ket = sbp.cursor;
            sbp.slice_from('Y');
            B_Y_found = true;
        }
        sbp.cursor = v_1;
        while (true) {
            v_2 = sbp.cursor;
            if (sbp.in_grouping(g_v, 97, 121)) {
                sbp.bra = sbp.cursor;
                if (sbp.eq_s(1, 'y')) {
                    sbp.ket = sbp.cursor;
                    sbp.cursor = v_2;
                    sbp.slice_from('Y');
                    B_Y_found = true;
                    continue;
                }
            }
            if (v_2 >= sbp.limit) {
                sbp.cursor = v_1;
                return;
            }
            sbp.cursor = v_2 + 1;
        }
    }
    function r_mark_regions() {
        var v_1 = sbp.cursor;
        I_p1 = sbp.limit;
        I_p2 = I_p1;
        if (!sbp.find_among(a_0, 3)) {
            sbp.cursor = v_1;
            if (habr1()) {
                sbp.cursor = v_1;
                return;
            }
        }
        I_p1 = sbp.cursor;
        if (!habr1()) I_p2 = sbp.cursor;
    }
    function habr1() {
        while (!sbp.in_grouping(g_v, 97, 121)) {
            if (sbp.cursor >= sbp.limit) {
                return true;
            }sbp.cursor++;
        }
        while (!sbp.out_grouping(g_v, 97, 121)) {
            if (sbp.cursor >= sbp.limit) {
                return true;
            }sbp.cursor++;
        }
        return false;
    }
    function r_shortv() {
        var v_1 = sbp.limit - sbp.cursor;
        if (!(sbp.out_grouping_b(g_v_WXY, 89, 121) && sbp.in_grouping_b(g_v, 97, 121) && sbp.out_grouping_b(g_v, 97, 121))) {
            sbp.cursor = sbp.limit - v_1;
            if (!sbp.out_grouping_b(g_v, 97, 121) || !sbp.in_grouping_b(g_v, 97, 121) || sbp.cursor > sbp.limit_backward) {
                return false;
            }
        }
        return true;
    }
    function r_R1() {
        return I_p1 <= sbp.cursor;
    }
    function r_R2() {
        return I_p2 <= sbp.cursor;
    }
    function r_Step_1a() {
        var among_var,
            v_1 = sbp.limit - sbp.cursor;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_1, 3);
        if (among_var) {
            sbp.bra = sbp.cursor;
            if (among_var == 1) sbp.slice_del();
        } else sbp.cursor = sbp.limit - v_1;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_2, 6);
        if (among_var) {
            sbp.bra = sbp.cursor;
            switch (among_var) {
                case 1:
                    sbp.slice_from('ss');
                    break;
                case 2:
                    var c = sbp.cursor - 2;
                    if (sbp.limit_backward > c || c > sbp.limit) {
                        sbp.slice_from('ie');
                        break;
                    }
                    sbp.cursor = c;
                    sbp.slice_from('i');
                    break;
                case 3:
                    do {
                        if (sbp.cursor <= sbp.limit_backward) {
                            return;
                        }sbp.cursor--;
                    } while (!sbp.in_grouping_b(g_v, 97, 121));
                    sbp.slice_del();
                    break;
            }
        }
    }
    function r_Step_1b() {
        var among_var, v_1, v_3, v_4;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_4, 6);
        if (among_var) {
            sbp.bra = sbp.cursor;
            switch (among_var) {
                case 1:
                    if (r_R1()) sbp.slice_from('ee');
                    break;
                case 2:
                    v_1 = sbp.limit - sbp.cursor;
                    while (!sbp.in_grouping_b(g_v, 97, 121)) {
                        if (sbp.cursor <= sbp.limit_backward) {
                            return;
                        }sbp.cursor--;
                    }
                    sbp.cursor = sbp.limit - v_1;
                    sbp.slice_del();
                    v_3 = sbp.limit - sbp.cursor;
                    among_var = sbp.find_among_b(a_3, 13);
                    if (among_var) {
                        sbp.cursor = sbp.limit - v_3;
                        switch (among_var) {
                            case 1:
                                var c = sbp.cursor;
                                sbp.insert(sbp.cursor, sbp.cursor, 'e');
                                sbp.cursor = c;
                                break;
                            case 2:
                                sbp.ket = sbp.cursor;
                                if (sbp.cursor > sbp.limit_backward) {
                                    sbp.cursor--;
                                    sbp.bra = sbp.cursor;
                                    sbp.slice_del();
                                }
                                break;
                            case 3:
                                if (sbp.cursor == I_p1) {
                                    v_4 = sbp.limit - sbp.cursor;
                                    if (r_shortv()) {
                                        sbp.cursor = sbp.limit - v_4;
                                        var c = sbp.cursor;
                                        sbp.insert(sbp.cursor, sbp.cursor, 'e');
                                        sbp.cursor = c;
                                    }
                                }
                                break;
                        }
                    }
                    break;
            }
        }
    }
    function r_Step_1c() {
        var v_1 = sbp.limit - sbp.cursor;
        sbp.ket = sbp.cursor;
        if (!sbp.eq_s_b(1, 'y')) {
            sbp.cursor = sbp.limit - v_1;
            if (!sbp.eq_s_b(1, 'Y')) {
                return;
            }
        }
        sbp.bra = sbp.cursor;
        if (sbp.out_grouping_b(g_v, 97, 121) && sbp.cursor > sbp.limit_backward) sbp.slice_from('i');
    }
    function r_Step_2() {
        var among_var;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_5, 24);
        if (among_var) {
            sbp.bra = sbp.cursor;
            if (r_R1()) {
                switch (among_var) {
                    case 1:
                        sbp.slice_from('tion');
                        break;
                    case 2:
                        sbp.slice_from('ence');
                        break;
                    case 3:
                        sbp.slice_from('ance');
                        break;
                    case 4:
                        sbp.slice_from('able');
                        break;
                    case 5:
                        sbp.slice_from('ent');
                        break;
                    case 6:
                        sbp.slice_from('ize');
                        break;
                    case 7:
                        sbp.slice_from('ate');
                        break;
                    case 8:
                        sbp.slice_from('al');
                        break;
                    case 9:
                        sbp.slice_from('ful');
                        break;
                    case 10:
                        sbp.slice_from('ous');
                        break;
                    case 11:
                        sbp.slice_from('ive');
                        break;
                    case 12:
                        sbp.slice_from('ble');
                        break;
                    case 13:
                        if (sbp.eq_s_b(1, 'l')) sbp.slice_from('og');
                        break;
                    case 14:
                        sbp.slice_from('ful');
                        break;
                    case 15:
                        sbp.slice_from('less');
                        break;
                    case 16:
                        if (sbp.in_grouping_b(g_valid_LI, 99, 116)) sbp.slice_del();
                        break;
                }
            }
        }
    }
    function r_Step_3() {
        var among_var;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_6, 9);
        if (among_var) {
            sbp.bra = sbp.cursor;
            if (r_R1()) {
                switch (among_var) {
                    case 1:
                        sbp.slice_from('tion');
                        break;
                    case 2:
                        sbp.slice_from('ate');
                        break;
                    case 3:
                        sbp.slice_from('al');
                        break;
                    case 4:
                        sbp.slice_from('ic');
                        break;
                    case 5:
                        sbp.slice_del();
                        break;
                    case 6:
                        if (r_R2()) sbp.slice_del();
                        break;
                }
            }
        }
    }
    function r_Step_4() {
        var among_var, v_1;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_7, 18);
        if (among_var) {
            sbp.bra = sbp.cursor;
            if (r_R2()) {
                switch (among_var) {
                    case 1:
                        sbp.slice_del();
                        break;
                    case 2:
                        v_1 = sbp.limit - sbp.cursor;
                        if (!sbp.eq_s_b(1, 's')) {
                            sbp.cursor = sbp.limit - v_1;
                            if (!sbp.eq_s_b(1, 't')) {
                                return;
                            }
                        }
                        sbp.slice_del();
                        break;
                }
            }
        }
    }
    function r_Step_5() {
        var among_var, v_1;
        sbp.ket = sbp.cursor;
        among_var = sbp.find_among_b(a_8, 2);
        if (among_var) {
            sbp.bra = sbp.cursor;
            switch (among_var) {
                case 1:
                    v_1 = sbp.limit - sbp.cursor;
                    if (!r_R2()) {
                        sbp.cursor = sbp.limit - v_1;
                        if (!r_R1() || r_shortv()) {
                            return;
                        }sbp.cursor = sbp.limit - v_1;
                    }
                    sbp.slice_del();
                    break;
                case 2:
                    if (!r_R2() || !sbp.eq_s_b(1, 'l')) {
                        return;
                    }sbp.slice_del();
                    break;
            }
        }
    }
    function r_exception2() {
        sbp.ket = sbp.cursor;
        if (sbp.find_among_b(a_9, 8)) {
            sbp.bra = sbp.cursor;
            return sbp.cursor <= sbp.limit_backward;
        }
        return false;
    }
    function r_exception1() {
        var among_var;
        sbp.bra = sbp.cursor;
        among_var = sbp.find_among(a_10, 18);
        if (among_var) {
            sbp.ket = sbp.cursor;
            if (sbp.cursor >= sbp.limit) {
                switch (among_var) {
                    case 1:
                        sbp.slice_from('ski');
                        break;
                    case 2:
                        sbp.slice_from('sky');
                        break;
                    case 3:
                        sbp.slice_from('die');
                        break;
                    case 4:
                        sbp.slice_from('lie');
                        break;
                    case 5:
                        sbp.slice_from('tie');
                        break;
                    case 6:
                        sbp.slice_from('idl');
                        break;
                    case 7:
                        sbp.slice_from('gentl');
                        break;
                    case 8:
                        sbp.slice_from('ugli');
                        break;
                    case 9:
                        sbp.slice_from('earli');
                        break;
                    case 10:
                        sbp.slice_from('onli');
                        break;
                    case 11:
                        sbp.slice_from('singl');
                        break;
                }
                return true;
            }
        }
        return false;
    }
    function r_postlude() {
        var v_1;
        if (B_Y_found) {
            while (true) {
                v_1 = sbp.cursor;
                sbp.bra = v_1;
                if (sbp.eq_s(1, 'Y')) {
                    sbp.ket = sbp.cursor;
                    sbp.cursor = v_1;
                    sbp.slice_from('y');
                    continue;
                }
                sbp.cursor = v_1;
                if (sbp.cursor >= sbp.limit) {
                    return;
                }sbp.cursor++;
            }
        }
    }
    this.stem = function () {
        var v_1 = sbp.cursor;
        if (!r_exception1()) {
            sbp.cursor = v_1;
            var c = sbp.cursor + 3;
            if (0 <= c && c <= sbp.limit) {
                sbp.cursor = v_1;
                r_prelude();
                sbp.cursor = v_1;
                r_mark_regions();
                sbp.limit_backward = v_1;
                sbp.cursor = sbp.limit;
                r_Step_1a();
                sbp.cursor = sbp.limit;
                if (!r_exception2()) for (var i = 0; i < habr.length; i++) {
                    sbp.cursor = sbp.limit;
                    habr[i]();
                }
                sbp.cursor = sbp.limit_backward;
                r_postlude();
            }
        }
        return true;
    };
}

var EnStemmer = (function (_Stemmer) {
    function EnStemmer() {
        _classCallCheck(this, EnStemmer);

        _get(Object.getPrototypeOf(EnStemmer.prototype), 'constructor', this).call(this, 'en');
        this._stemmer = new EnglishStemmer();
    }

    _inherits(EnStemmer, _Stemmer);

    _createClass(EnStemmer, [{
        key: 'stem',
        value: function stem(word) {
            this._stemmer.setCurrent(word);
            this._stemmer.stem();
            return this._stemmer.getCurrent();
        }
    }]);

    return EnStemmer;
})(_Stemmer3['default']);

exports['default'] = EnStemmer;
module.exports = exports['default'];

/* jshint ignore:end */

},{"../../helpers/among":10,"../../helpers/snowball":12,"../Stemmer":8}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

/*!
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */

exports["default"] = Among;

function Among(s, substring_i, result, method) {
    if (!s && s !== "" || !substring_i && substring_i !== 0 || !result) throw "Bad Among initialisation: s: " + s + ", substring_i: " + substring_i + ", result: " + result;
    this.s_size = s.length;
    this.s = this.toCharArray(s);
    this.substring_i = substring_i;
    this.result = result;
    this.method = method;
}

Among.prototype.toCharArray = function (s) {
    var sLength = s.length,
        charArr = new Array(sLength);
    for (var i = 0; i < sLength; i++) charArr[i] = s.charCodeAt(i);
    return charArr;
};
module.exports = exports["default"];

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

/**
 * Replace accent symbols with their non accent variant
 * @function removeAccent
 * @memberOf nlpjs.helpers
 * @param {string} str string with accent characters
 * @returns {string} string with ascii characters
 * @example
 * removeAccent('Žluťoučký kůn ůpěl ďábelské ódy')
 * // => Zlutoucky kun upel dabelske ody
 */
exports['default'] = removeAccent;
var defaultDiacriticsRemovalap = [{ base: 'A', letters: 'AⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ' }, { base: 'AA', letters: 'Ꜳ' }, { base: 'AE', letters: 'ÆǼǢ' }, { base: 'AO', letters: 'Ꜵ' }, { base: 'AU', letters: 'Ꜷ' }, { base: 'AV', letters: 'ꜸꜺ' }, { base: 'AY', letters: 'Ꜽ' }, { base: 'B', letters: 'BⒷＢḂḄḆɃƂƁ' }, { base: 'C', letters: 'CⒸＣĆĈĊČÇḈƇȻꜾ' }, { base: 'D', letters: 'DⒹＤḊĎḌḐḒḎĐƋƊƉꝹ' }, { base: 'DZ', letters: 'ǱǄ' }, { base: 'Dz', letters: 'ǲǅ' }, { base: 'E', letters: 'EⒺＥÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚƐƎ' }, { base: 'F', letters: 'FⒻＦḞƑꝻ' }, { base: 'G', letters: 'GⒼＧǴĜḠĞĠǦĢǤƓꞠꝽꝾ' }, { base: 'H', letters: 'HⒽＨĤḢḦȞḤḨḪĦⱧⱵꞍ' }, { base: 'I', letters: 'IⒾＩÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬƗ' }, { base: 'J', letters: 'JⒿＪĴɈ' }, { base: 'K', letters: 'KⓀＫḰǨḲĶḴƘⱩꝀꝂꝄꞢ' }, { base: 'L', letters: 'LⓁＬĿĹĽḶḸĻḼḺŁȽⱢⱠꝈꝆꞀ' }, { base: 'LJ', letters: 'Ǉ' }, { base: 'Lj', letters: 'ǈ' }, { base: 'M', letters: 'MⓂＭḾṀṂⱮƜ' }, { base: 'N', letters: 'NⓃＮǸŃÑṄŇṆŅṊṈȠƝꞐꞤ' }, { base: 'NJ', letters: 'Ǌ' }, { base: 'Nj', letters: 'ǋ' }, { base: 'O', letters: 'OⓄＯÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘǪǬØǾƆƟꝊꝌ' }, { base: 'OI', letters: 'Ƣ' }, { base: 'OO', letters: 'Ꝏ' }, { base: 'OU', letters: 'Ȣ' }, { base: 'OE', letters: 'Œ' }, { base: 'oe', letters: 'œ' }, { base: 'P', letters: 'PⓅＰṔṖƤⱣꝐꝒꝔ' }, { base: 'Q', letters: 'QⓆＱꝖꝘɊ' }, { base: 'R', letters: 'RⓇＲŔṘŘȐȒṚṜŖṞɌⱤꝚꞦꞂ' }, { base: 'S', letters: 'SⓈＳẞŚṤŜṠŠṦṢṨȘŞⱾꞨꞄ' }, { base: 'T', letters: 'TⓉＴṪŤṬȚŢṰṮŦƬƮȾꞆ' }, { base: 'TZ', letters: 'Ꜩ' }, { base: 'U', letters: 'UⓊＵÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴɄ' }, { base: 'V', letters: 'VⓋＶṼṾƲꝞɅ' }, { base: 'VY', letters: 'Ꝡ' }, { base: 'W', letters: 'WⓌＷẀẂŴẆẄẈⱲ' }, { base: 'X', letters: 'XⓍＸẊẌ' }, { base: 'Y', letters: 'YⓎＹỲÝŶỸȲẎŸỶỴƳɎỾ' }, { base: 'Z', letters: 'ZⓏＺŹẐŻŽẒẔƵȤⱿⱫꝢ' }, { base: 'a', letters: 'aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐ' }, { base: 'aa', letters: 'ꜳ' }, { base: 'ae', letters: 'æǽǣ' }, { base: 'ao', letters: 'ꜵ' }, { base: 'au', letters: 'ꜷ' }, { base: 'av', letters: 'ꜹꜻ' }, { base: 'ay', letters: 'ꜽ' }, { base: 'b', letters: 'bⓑｂḃḅḇƀƃɓ' }, { base: 'c', letters: 'cⓒｃćĉċčçḉƈȼꜿↄ' }, { base: 'd', letters: 'dⓓｄḋďḍḑḓḏđƌɖɗꝺ' }, { base: 'dz', letters: 'ǳǆ' }, { base: 'e', letters: 'eⓔｅèéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛɇɛǝ' }, { base: 'f', letters: 'fⓕｆḟƒꝼ' }, { base: 'g', letters: 'gⓖｇǵĝḡğġǧģǥɠꞡᵹꝿ' }, { base: 'h', letters: 'hⓗｈĥḣḧȟḥḩḫẖħⱨⱶɥ' }, { base: 'hv', letters: 'ƕ' }, { base: 'i', letters: 'iⓘｉìíîĩīĭïḯỉǐȉȋịįḭɨı' }, { base: 'j', letters: 'jⓙｊĵǰɉ' }, { base: 'k', letters: 'kⓚｋḱǩḳķḵƙⱪꝁꝃꝅꞣ' }, { base: 'l', letters: 'lⓛｌŀĺľḷḹļḽḻſłƚɫⱡꝉꞁꝇ' }, { base: 'lj', letters: 'ǉ' }, { base: 'm', letters: 'mⓜｍḿṁṃɱɯ' }, { base: 'n', letters: 'nⓝｎǹńñṅňṇņṋṉƞɲŉꞑꞥ' }, { base: 'nj', letters: 'ǌ' }, { base: 'o', letters: 'oⓞｏòóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộǫǭøǿɔꝋꝍɵ' }, { base: 'oi', letters: 'ƣ' }, { base: 'ou', letters: 'ȣ' }, { base: 'oo', letters: 'ꝏ' }, { base: 'p', letters: 'pⓟｐṕṗƥᵽꝑꝓꝕ' }, { base: 'q', letters: 'qⓠｑɋꝗꝙ' }, { base: 'r', letters: 'rⓡｒŕṙřȑȓṛṝŗṟɍɽꝛꞧꞃ' }, { base: 's', letters: 'sⓢｓßśṥŝṡšṧṣṩșşȿꞩꞅẛ' }, { base: 't', letters: 'tⓣｔṫẗťṭțţṱṯŧƭʈⱦꞇ' }, { base: 'tz', letters: 'ꜩ' }, { base: 'u', letters: 'uⓤｕùúûũṹūṻŭüǜǘǖǚủůűǔȕȗưừứữửựụṳųṷṵʉ' }, { base: 'v', letters: 'vⓥｖṽṿʋꝟʌ' }, { base: 'vy', letters: 'ꝡ' }, { base: 'w', letters: 'wⓦｗẁẃŵẇẅẘẉⱳ' }, { base: 'x', letters: 'xⓧｘẋẍ' }, { base: 'y', letters: 'yⓨｙỳýŷỹȳẏÿỷẙỵƴɏỿ' }, { base: 'z', letters: 'zⓩｚźẑżžẓẕƶȥɀⱬꝣ' }];
var diacriticsMap = {};
for (var i = 0; i < defaultDiacriticsRemovalap.length; i++) {
    var letters = defaultDiacriticsRemovalap[i].letters.split('');
    for (var j = 0; j < letters.length; j++) {
        diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
    }
}
function removeAccent(str) {
    return str.replace(/[^\u0000-\u007E]/g, function (a) {
        return diacriticsMap[a] || a;
    });
}

;
module.exports = exports['default'];

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
/*!
 * Snowball JavaScript Library v0.3
 * http://code.google.com/p/urim/
 * http://snowball.tartarus.org/
 *
 * Copyright 2010, Oleg Mazko
 * http://www.mozilla.org/MPL/
 */
/* jshint ignore:start */

exports["default"] = SnowballProgram;

function SnowballProgram() {
    var current;
    return {
        bra: 0,
        ket: 0,
        limit: 0,
        cursor: 0,
        limit_backward: 0,
        setCurrent: function setCurrent(word) {
            current = word;
            this.cursor = 0;
            this.limit = word.length;
            this.limit_backward = 0;
            this.bra = this.cursor;
            this.ket = this.limit;
        },
        getCurrent: function getCurrent() {
            var result = current;
            current = null;
            return result;
        },
        in_grouping: function in_grouping(s, min, max) {
            if (this.cursor < this.limit) {
                var ch = current.charCodeAt(this.cursor);
                if (ch <= max && ch >= min) {
                    ch -= min;
                    if (s[ch >> 3] & 1 << (ch & 7)) {
                        this.cursor++;
                        return true;
                    }
                }
            }
            return false;
        },
        in_grouping_b: function in_grouping_b(s, min, max) {
            if (this.cursor > this.limit_backward) {
                var ch = current.charCodeAt(this.cursor - 1);
                if (ch <= max && ch >= min) {
                    ch -= min;
                    if (s[ch >> 3] & 1 << (ch & 7)) {
                        this.cursor--;
                        return true;
                    }
                }
            }
            return false;
        },
        out_grouping: function out_grouping(s, min, max) {
            if (this.cursor < this.limit) {
                var ch = current.charCodeAt(this.cursor);
                if (ch > max || ch < min) {
                    this.cursor++;
                    return true;
                }
                ch -= min;
                if (!(s[ch >> 3] & 1 << (ch & 7))) {
                    this.cursor++;
                    return true;
                }
            }
            return false;
        },
        out_grouping_b: function out_grouping_b(s, min, max) {
            if (this.cursor > this.limit_backward) {
                var ch = current.charCodeAt(this.cursor - 1);
                if (ch > max || ch < min) {
                    this.cursor--;
                    return true;
                }
                ch -= min;
                if (!(s[ch >> 3] & 1 << (ch & 7))) {
                    this.cursor--;
                    return true;
                }
            }
            return false;
        },
        eq_s: function eq_s(s_size, s) {
            if (this.limit - this.cursor < s_size) {
                return false;
            }for (var i = 0; i < s_size; i++) if (current.charCodeAt(this.cursor + i) != s.charCodeAt(i)) {
                return false;
            }this.cursor += s_size;
            return true;
        },
        eq_s_b: function eq_s_b(s_size, s) {
            if (this.cursor - this.limit_backward < s_size) {
                return false;
            }for (var i = 0; i < s_size; i++) if (current.charCodeAt(this.cursor - s_size + i) != s.charCodeAt(i)) {
                return false;
            }this.cursor -= s_size;
            return true;
        },
        find_among: function find_among(v, v_size) {
            var i = 0,
                j = v_size,
                c = this.cursor,
                l = this.limit,
                common_i = 0,
                common_j = 0,
                first_key_inspected = false;
            while (true) {
                var k = i + (j - i >> 1),
                    diff = 0,
                    common = common_i < common_j ? common_i : common_j,
                    w = v[k];
                for (var i2 = common; i2 < w.s_size; i2++) {
                    if (c + common == l) {
                        diff = -1;
                        break;
                    }
                    diff = current.charCodeAt(c + common) - w.s[i2];
                    if (diff) break;
                    common++;
                }
                if (diff < 0) {
                    j = k;
                    common_j = common;
                } else {
                    i = k;
                    common_i = common;
                }
                if (j - i <= 1) {
                    if (i > 0 || j == i || first_key_inspected) break;
                    first_key_inspected = true;
                }
            }
            while (true) {
                var w = v[i];
                if (common_i >= w.s_size) {
                    this.cursor = c + w.s_size;
                    if (!w.method) {
                        return w.result;
                    }var res = w.method();
                    this.cursor = c + w.s_size;
                    if (res) {
                        return w.result;
                    }
                }
                i = w.substring_i;
                if (i < 0) {
                    return 0;
                }
            }
        },
        find_among_b: function find_among_b(v, v_size) {
            var i = 0,
                j = v_size,
                c = this.cursor,
                lb = this.limit_backward,
                common_i = 0,
                common_j = 0,
                first_key_inspected = false;
            while (true) {
                var k = i + (j - i >> 1),
                    diff = 0,
                    common = common_i < common_j ? common_i : common_j,
                    w = v[k];
                for (var i2 = w.s_size - 1 - common; i2 >= 0; i2--) {
                    if (c - common == lb) {
                        diff = -1;
                        break;
                    }
                    diff = current.charCodeAt(c - 1 - common) - w.s[i2];
                    if (diff) break;
                    common++;
                }
                if (diff < 0) {
                    j = k;
                    common_j = common;
                } else {
                    i = k;
                    common_i = common;
                }
                if (j - i <= 1) {
                    if (i > 0 || j == i || first_key_inspected) break;
                    first_key_inspected = true;
                }
            }
            while (true) {
                var w = v[i];
                if (common_i >= w.s_size) {
                    this.cursor = c - w.s_size;
                    if (!w.method) {
                        return w.result;
                    }var res = w.method();
                    this.cursor = c - w.s_size;
                    if (res) {
                        return w.result;
                    }
                }
                i = w.substring_i;
                if (i < 0) {
                    return 0;
                }
            }
        },
        replace_s: function replace_s(c_bra, c_ket, s) {
            var adjustment = s.length - (c_ket - c_bra),
                left = current.substring(0, c_bra),
                right = current.substring(c_ket);
            current = left + s + right;
            this.limit += adjustment;
            if (this.cursor >= c_ket) this.cursor += adjustment;else if (this.cursor > c_bra) this.cursor = c_bra;
            return adjustment;
        },
        slice_check: function slice_check() {
            if (this.bra < 0 || this.bra > this.ket || this.ket > this.limit || this.limit > current.length) throw "faulty slice operation";
        },
        slice_from: function slice_from(s) {
            this.slice_check();
            this.replace_s(this.bra, this.ket, s);
        },
        slice_del: function slice_del() {
            this.slice_from("");
        },
        insert: function insert(c_bra, c_ket, s) {
            var adjustment = this.replace_s(c_bra, c_ket, s);
            if (c_bra <= this.bra) this.bra += adjustment;
            if (c_bra <= this.ket) this.ket += adjustment;
        },
        slice_to: function slice_to() {
            this.slice_check();
            return current.substring(this.bra, this.ket);
        },
        eq_v_b: function eq_v_b(s) {
            return this.eq_s_b(s.length, s);
        }
    };
}
/* jshint ignore:end */

module.exports = exports["default"];

},{}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * List to map
 * @param {Array} list
 * @param {string} [key]
 * @returns {{}}
 */
exports.l2m = l2m;

function l2m(list, key) {
    var hasKey = typeof key === 'string';
    var map = {};
    for (var i = 0, ii = list.length; i < ii; i++) {
        if (hasKey) {
            map[list[i][key]] = list[i];
        } else {
            if (key) {
                map[list[i]] = { v: list[i] };
            } else {
                map[list[i]] = list[i];
            }
        }
    }
    return map;
}

/**
 * @class StringBuffer
 */

var StringBuffer = (function () {
    function StringBuffer(str) {
        _classCallCheck(this, StringBuffer);

        this.str = str || '';
    }

    _createClass(StringBuffer, [{
        key: 'length',
        value: function length() {
            return this.str.length;
        }
    }, {
        key: 'substring',
        value: function substring(a, b) {
            return new StringBuffer(this.str.substring(a, b));
        }
    }, {
        key: 'toString',
        value: function toString() {
            return this.str;
        }
    }, {
        key: 'equals',
        value: function equals(x) {
            return this.str === x;
        }
    }, {
        key: 'insert',
        value: function insert(i, s) {
            this._splice(i, 0, s);
        }
    }, {
        key: 'delete',
        value: function _delete(a, b) {
            this._splice(a, b - a);
        }
    }, {
        key: 'replace',
        value: function replace(a, b, s) {
            this._splice(a, b - a, s);
        }
    }, {
        key: '_splice',
        value: function _splice() {
            var characterArray = this.str.split('');
            Array.prototype.splice.apply(characterArray, arguments);
            this.str = characterArray.join('');
        }
    }, {
        key: 'charAt',
        value: function charAt(i) {
            return this.str[i];
        }
    }]);

    return StringBuffer;
})();

exports.StringBuffer = StringBuffer;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _l2m = require('../helpers/structures.js');

var _removeAccent = require('../helpers/removeAccent.js');

var _removeAccent2 = _interopRequireDefault(_removeAccent);

var _AnnotationSet = require('../core/AnnotationSet.js');

var _AnnotationSet2 = _interopRequireDefault(_AnnotationSet);

/**
 * Generic tokenizer
 * @class nlpjs.tokenizer.Tokenizer
 * @example
 * var document = new Document();
 * document.text = "Good idea said the voice. It's getting crowded in here.";
 * new Tokenizer().tokenize(document);
 * document.annotations.type('word').length
 * // => 10
 * document.annotations.type('sentence').length
 * // => 2
 * document.annotations.type('sentence').type('word').last.text
 * // => 'voice'
 */

var Tokenizer = (function () {
    function Tokenizer() {
        _classCallCheck(this, Tokenizer);

        this.capitals = 'A-ZĚŠČŘŽÝÁÍÉÚŮ';
        this.sentenceTerminators = '?.!';
        this.abbrs = [];
        this.ignoredCharacters = '0-9 "?!.,:;()–|/„'.split('').concat('\\[', '\\]');
        this.dateRegex = /(?:(?:[1-3][0-9])|(?:0?[1-9]))\.\s*(?:(?:1[0-2])|(?:0?[1-9]))\.(?:\s*[0-9]{4}|[0-9]{2})?/g;
        this.timeRegex = /[1-2]?[0-9]:[0-5][0-9](?::[0-5][0-9])?/g;
        this.durationRegex = /((?:[0-9]+\s*h)?\s*(?:[0-9]+\s*m))(?:\s|[,.!?])/g;
        this.numberRegex = new RegExp('(([-+]?)[0-9]+(?:[/,.-][0-9]+)?)([.:]?)', 'g');
        this.stopWordsList = [];
        this._build();
    }

    _createClass(Tokenizer, [{
        key: '_build',

        /**
         * Generates Regexes from options
         * @private
         */
        value: function _build() {
            var abbrsRegex = this.abbrs.map(function (abb) {
                return '(?:' + abb + '\\.)';
            });
            var sentenceContent = abbrsRegex.concat(['[^' + this.capitals + this.sentenceTerminators + ']', '(?:°C)', '(?:°F)']).join('|');
            this.sentenceRegex = new RegExp('([' + this.capitals + '](?:' + sentenceContent + ')+([' + this.sentenceTerminators + ']+|$))(?:\\s|[' + this.capitals + ']|$)', 'g');
            this.wordRegex = new RegExp('[^' + this.ignoredCharacters.join('') + ']+', 'g');
            this.stopWords = _l2m.l2m(this.stopWordsList);
        }
    }, {
        key: '_isStopword',

        /**
         * Tests word on stopword
         * @param word
         * @returns {boolean}
         * @private
         */
        value: function _isStopword(word) {
            return !!this.stopWords[_removeAccent2['default'](word.toLowerCase())];
        }
    }, {
        key: 'tokenize',

        /**
         * Complete tokenization of text of the document.
         * @method nlpjs.tokenizer.Tokenizer#tokenize
         * @param {nlpjs.core.Document} document
         * @return {nlpjs.core.Document} annotated document
         */
        value: function tokenize(document) {
            var tokens = [];
            tokens = tokens.concat(this.words(document, true));
            tokens = tokens.concat(this.numbers(document, true));
            tokens = tokens.concat(this.lines(document, true));
            tokens = tokens.concat(this.times(document, true));
            document.annotations.add(tokens);
            tokens = [];
            tokens = tokens.concat(this.sentences(document, true));
            tokens = tokens.concat(this.stopwords(document));
            document.annotations.add(tokens);
            return document;
        }
    }, {
        key: 'stopwords',

        /**
         * Annotate stopwords
         * @method nlpjs.tokenizer.Tokenizer#stopwords
         * @param {nlpjs.core.Document} document document to process
         * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
         */
        value: function stopwords(document) {
            var _this = this;

            document.annotations.type('word').each(function (word) {
                return _this._isStopword(word.text) ? word.features.stopword = true : undefined;
            });
            return document;
        }
    }, {
        key: 'words',

        /**
         * Creates word tokens
         * @method nlpjs.tokenizer.Tokenizer#words
         * @param {nlpjs.core.Document} document document to process
         * @param {boolean} returnTokens returns Annotations instead of document with added annotations
         * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
         */
        value: function words(document, returnTokens) {
            var tokens = [];
            document.text.replace(this.wordRegex, function (word, position) {
                tokens.push(_AnnotationSet2['default'].createAnnotation(position, position + word.length, 'word', {}));
            });
            if (returnTokens) {
                return tokens;
            }document.annotations.add(tokens);
            return document;
        }
    }, {
        key: 'numbers',

        /**
         * Creates tokens of any numbers within document
         * @method nlpjs.tokenizer.Tokenizer#numbers
         * @param {nlpjs.core.Document} document document to process
         * @param {boolean} returnTokens returns Annotations instead of document with added annotations
         * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
         */
        value: function numbers(document, returnTokens) {
            var tokens = [];
            document.text.replace(this.numberRegex, function (word, number, negation, terminator, position) {
                tokens.push(_AnnotationSet2['default'].createAnnotation(position, position + word.length, 'number', {
                    negative: negation == '-',
                    terminator: terminator
                }));
            });
            if (returnTokens) {
                return tokens;
            }document.annotations.add(tokens);
            return document;
        }
    }, {
        key: 'times',

        /**
         * Creates tokens of any numbers within document
         * @method nlpjs.tokenizer.Tokenizer#times
         * @param {nlpjs.core.Document} document document to process
         * @param {boolean} returnTokens returns Annotations instead of document with added annotations
         * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
         */
        value: function times(document, returnTokens) {
            var tokens = [];
            if (this.dateRegex) document.text.replace(this.dateRegex, function (word, position) {
                tokens.push(_AnnotationSet2['default'].createAnnotation(position, position + word.length, 'time', {
                    type: 'date'
                }));
            });
            if (this.timeRegex) document.text.replace(this.timeRegex, function (word, position) {
                tokens.push(_AnnotationSet2['default'].createAnnotation(position, position + word.length, 'time', {
                    type: 'time'
                }));
            });
            if (this.durationRegex) document.text.replace(this.durationRegex, function (match, word, position) {
                tokens.push(_AnnotationSet2['default'].createAnnotation(position, position + word.length, 'time', {
                    type: 'duration'
                }));
            });
            if (returnTokens) {
                return tokens;
            }document.annotations.add(tokens);
            return document;
        }
    }, {
        key: 'sentences',

        /**
         * Creates sentence tokens with type of sentence
         * (interrorative, impertative or declarative)
         * @method nlpjs.tokenizer.Tokenizer#sentences
         * @param {nlpjs.core.Document} document document to process
         * @param {boolean} returnTokens returns Annotations instead of document with added annotations
         * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
         */
        value: function sentences(document, returnTokens) {
            var sentence,
                offset,
                line,
                tokens = [],
                annotations = document.annotations,
                self = this;
            document.text.replace(this.sentenceRegex, function (match, sentence, type, position) {
                for (var i = 0, ii = self.abbrs.length; i < ii; i++) {
                    if (sentence.indexOf(self.abbrs[i]) == sentence.length - self.abbrs[i].length) return;
                }
                if (type === '?') type = 'interrorative';else if (type === '!') type = 'imperative';else type = 'declarative';
                offset = match.length - sentence.length - 1;
                sentence = _AnnotationSet2['default'].createAnnotation(offset + position, offset + position + sentence.length, 'sentence', { type: type });
                // try fix using line
                line = annotations.get(sentence.start, sentence.end).type('line').first;
                if (line) {
                    if (sentence.start !== line.start) {
                        var prev_sentence = tokens[tokens.length - 1];
                        if (prev_sentence && prev_sentence.start >= line.start) {
                            sentence.start = prev_sentence.end;
                        } else {
                            sentence.start = line.start;
                        }
                    }
                }
                tokens.push(sentence);
            });
            if (returnTokens) {
                return tokens;
            }document.annotations.add(tokens);
            return document;
        }
    }, {
        key: 'lines',

        /**
         * Creates semantic line tokens, semantic line is text
         * within html tags with semantic of line - text that would
         * be display on screen of infinite width without css as single line.
         * Line doesn't contain other line
         * @method nlpjs.tokenizer.Tokenizer#lines
         * @param {nlpjs.core.Document} document document to process
         * @param {boolean} returnTokens returns Annotations instead of document with added annotations
         * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
         */
        value: function lines(document, returnTokens) {
            var tokens = [];
            var tags = {
                p: true,
                li: true,
                tr: true
                /*div: true,
                 h1 : true,
                 h2 : true,
                 h3 : true*/
            };

            var breaks = [];

            document.annotations.type('html').each(function (an) {
                if (tags[an.features.element]) {
                    tokens.push(_AnnotationSet2['default'].createAnnotation(an.start, an.end, 'line'));
                } else if (an.features.element == 'br') {
                    breaks.push(an);
                }
            });

            for (var i = 0, ii = breaks.length; i < ii; i++) {
                // break all paired tags with line break tags
                for (var j = 0, jj = tokens.length; j < jj; j++) {
                    if (tokens[j].start < breaks[i].start && tokens[j].end > breaks[i].end) {
                        tokens.push(_AnnotationSet2['default'].createAnnotation(breaks[i].end, tokens[j].end, 'line'));
                        tokens[j].end = breaks[i].start;
                        jj++;
                    }
                }
            }

            var removed = {};
            tokens = tokens.filter(function (token, j) {
                // remove lines containing line(s)
                for (var i = 0, ii = tokens.length; i < ii; i++) {
                    if (i !== j && !removed[i] && token.start <= tokens[i].start && token.end >= tokens[i].end) {
                        removed[j] = true;
                        return false;
                    }
                }
                return true;
            });

            if (returnTokens) {
                return tokens;
            }document.annotations.add(tokens);
            return document;
        }
    }]);

    return Tokenizer;
})();

exports['default'] = Tokenizer;
module.exports = exports['default'];

},{"../core/AnnotationSet.js":4,"../helpers/removeAccent.js":11,"../helpers/structures.js":13}]},{},[1])