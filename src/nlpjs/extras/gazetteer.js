import Levenshtein from '../distance/levenshtein';

/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 * @class Gazeteer
 * @memberOf nlpjs.extras
 * @description Enhance words in document from provided list by provided features
 * @param {Array<String>} wordslist list of words to find
 * @param {object} features features to add
 * @param {number} threshold maximum distance from list word defaults to 0
 * @param {Levenshtein|Hamming|{distance:function}}metric metric to use for distance, default to standard Levenshtein
 */
export default class Gazetteer {

    constructor(wordslist, features, threshold=0, metric=Levenshtein){
        this.wordlist = wordslist;
        this.features = features;
        this.threshold = threshold;
        this.metric = metric;
    }

    /**
     * Apply gazetteer onto annotations of provided type of provided document
     * @name nlpjs.extras.Gazeteer
     * @param {nlpjs.core.Document} document document to enhance
     * @param {string} token type of annotations that should be used
     */
    apply(document, token='word'){
        var self = this;

        document.annotations.type(token).each(function(annotation){
            for (var i=0, ii=self.wordlist; i<ii; i+=1) {
                if (self._isWordMatch(annotation, word)) {
                    for (var key in self.features) {
                        if (self.features.hasOwnProperty(key)) {
                            annotation.features[key] = self.features[key];
                        }
                    }
                }
            }
        });
    }

    /**
     *
     * @param annotation
     * @param word
     * @private
     */
    _isWordMatch(annotation, word){
        if (this.threshold > 0){
            if (annotation.features.stem && this.metric.distance(annotation.features.stem, word) <= this.threshold){
                return true;
            }
            return this.metric.distance(annotation.text, word) <= this.threshold;
        } else {
            return annotation.features.stem === word || annotation.text === word;
        }
    }



}