export default class NGram {

    /**
     * N-gram frequency analysis
     * @class nlpjs.classifier.NGram
     * @property {object} model
     * @param {Object.<string,Array>} model
     * @param {number} n
     * @param {number} m
     * @param {number} [top]
     */
    constructor(model, n, m, top = Infinity){
        this.model = model;
        this.n = n;
        this.m = m;
        this.top = top;
        var label;
        for (label in this.model){
            if (this.model.hasOwnProperty(label)){
                this.top = Math.min(this.top, this.model[label].length);
            }
        }
        for (label in this.model) {
            if (this.model.hasOwnProperty(label)) {
                this.model[label].splice(this.top, Infinity);
            }
        }
    }

    /**
     * Classify text
     * @method nlpjs.classifier.NGram#classify
     * @param {string} text
     * @param {number} [threshold]
     * @returns {string} label of class
     */
    classify(text, threshold = Infinity){
        var scores = this.scores(text);
        var min = Infinity;
        var minLabel = null;
        for (var label in scores){
            if (scores.hasOwnProperty(label)){
                if (scores[label] < min && scores[label]/this.top < threshold){
                    min = scores[label];
                    minLabel = label;
                }
            }
        }
        return minLabel;
    }

    /**
     * @method nlpjs.classifier.NGram#scores
     * @param {string} text text to calculate score from
     * @returns {{}}
     */
    scores(text){
        var sample = NGram.ranked(NGram.compute(text, this.n, this.m)).splice(0, this.top);
        var scores = {};
        for (var label in this.model){
            if (this.model.hasOwnProperty(label)){
                var model = this.model[label];
                scores[label] = NGram.distance(model, sample);
            }
        }
        return scores;
    }


    /**
     * Serialized model to json
     * @method nlpjs.classifier.NGram#toJSON
     * @retuns {string} json
     */
    toJSON(){
        var serialized = {
            n : this.n,
            m : this.m,
            top: this.top,
            model: {}
        };

        for(var label in this.model){
            if (this.model.hasOwnProperty(label)) {
                serialized.model[label] = this.model[label].join('|');
            }
        }

        return JSON.stringify(serialized);
    }


    /**
     * Deserialize model from json
     * @method nlpjs.classifier.NGram.fromJSON
     * @param {string} json
     */
    static fromJSON(json){
        json = JSON.parse(json);
        for (var label in json.model){
            if (json.model.hasOwnProperty(label)){
                json.model[label] = json.model[label].split('|');
            }
        }
        return new NGram(json.model, json.n, json.m, json.top);
    }


    /**
     * @method nlpjs.classifier.NGram.fromText
     * @static
     * @param models
     * @param n
     * @param m
     * @param top
     */
    static fromText(models, n, m, top){
        var model = {};
        for (var label in models){
            if (models.hasOwnProperty(label)){
                model[label] = NGram.ranked(NGram.compute(models[label], n, m));
            }
        }
        return new NGram(model, n, m, top);
    }

    /**
     * @method nlpjs.classifier.NGram.ranked
     * @param model
     * @returns {Array}
     */
    static ranked(model){
        var list = NGram.stats(model);
        list.sort((a,b) => (a.c > b.c) ? -1 : ((a.c < b.c) ? 1 : (a.w < b.w ? -1 : 1)));
        return list.map((x) => x.w) ;
    }

    /**
     * @method nlpjs.classifier.NGram.distance
     * @param a
     * @param b
     * @returns {number}
     */
    static distance(a, b){
        var size = a.length;
        var j;
        var distance = 0;
        for(var i=0, ii=size;i<ii;i++){
            j = b.indexOf(a[i]);
            if (j == -1){
                distance += size;
            } else {
                distance += Math.abs(i - j);
            }
        }
        return distance;
    }

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
    static compute(input, n, m){
        if (m === undefined)
            m = n;

        var dict = {},
            buffer = [],
            word,
            i = 0,
            text = ('_' + input + '_').replace(/(\s|[.,!?])+/g,'_') // replace punctuation with _
                .replace(/_+/, '_')
                .replace(/[0-9()°|><-]/g,'') // remove
                .toLowerCase()
                .split('');

        for (;n<=m;n++){
            buffer = [];
            for(i=0;i<text.length;i++) {
                buffer.push(text[i]);
                if (buffer.length == n){
                    word = buffer.join('');
                    if (word !== '_'){
                        dict[word] = (dict[word] || 0) + 1;
                    }
                    buffer.shift();
                }
            }
        }
        return dict;
    }


    /**
     * N-gram frequency analysis with
     * frequency statistics, counts and rank
     * @method nlpjs.classifier.NGram.stats
     * @return {Object[]} with keys f, w, r, c
     */
    static stats(ngrams) {
        var arr = [];
        for (var ngram in ngrams){
            if (ngrams.hasOwnProperty(ngram)) {
                arr.push({
                    c: ngrams[ngram],
                    w: ngram
                });
            }
        }

        var totalCount = arr.reduce(function(sum, ngram) { return sum + ngram.c; }, 0);
        if (totalCount < 1)
            totalCount = 1;

        for (var i=0; i<arr.length; i++) {
            arr[i].f = arr[i].c/totalCount;
            arr[i].r = i;
        }
        return arr;
    }

    static compare (text, top, n, m) {
        var thisNgrams = NGram.stats.apply(this, [text, n, m]).slice(0, top);
        console.log(thisNgrams);
        var self = this;
        return function(){
            return Array.prototype.slice.call(arguments, 0).map(function(ngrams){
                var reverseIndex = {};

                ngrams = ngrams.slice(0,top);
                for (var i=0;i<ngrams.length;i+=1) {
                    reverseIndex[ngrams[i].w] = ngrams[i];
                }
                return self._ngramScore(thisNgrams, reverseIndex);
            });
        };
    }

    static _ngramScore(ngrams, reverseIndex) {
        var distance = 0;
        var max = Object.keys(reverseIndex).length;
        var penalties = [];
        for (var i=0;i<ngrams.length;i+=1) {
            var gram = ngrams[i];
            var model = reverseIndex[gram.w];
            var penalty = (model === undefined) ? max : Math.abs(gram.r - model.r);
            penalties.push(penalty);
            distance += penalty;
        }
        return distance/ngrams.length;
    }

    /**
     * Saves model into json
     * @param data
     * @param top
     * @returns {*}
     * @deprecated use toJson
     */
    static save(data, top){
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

    /**
     * Loads model from json
     * @param json
     * @returns {{}}
     * @deprecated use NGram.fromJSON
     */
    static load(json){
        var exp = {};
        var data = (typeof(json) === 'string') ? JSON.parse(json) : json;
        for (var key in data){
            if (data.hasOwnProperty(key))
                exp[key] = data[key].split('|').map(function(x, i){
                    return { w: x, r: i };
                });
        }
        return exp;
    }

    static importUrl(url){
        return http.get(url).then(function(x){
            return NGram.import(x);
        });
    }

}