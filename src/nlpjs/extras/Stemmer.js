/**
 * @abstract
 * @class nlpjs.extras.Stemmer
 * @property {string} language language this stemmer stems
 */
export default class Stemmer {

    constructor(language){
        this._language = language;
    }

    get language() {
        return this._language;
    }


    /**
     * @abstract
     * @name nlpjs.extras.Stemmer#stem
     * @param {string} word word to stem
     * @return {string} stemmed word
     */
    stem(word){

    }

    /**
     * @name nlpjs.extras.Stemmer#stemDocument
     * @param {nlpjs.core.Document} document
     * @param {string} type annotation type to stem
     */
    stemDocument(document, type = 'word'){
        var self = this;
        var text = document.text;
        var words = document.annotations.type(type);
        words.each(function(word){
            var w = text.slice(word.start, word.end);
            word.features.stem = self.stem(w);
        });
    }
}