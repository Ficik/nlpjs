import { l2m } from '../helpers/structures.js';
import removeAccent from '../helpers/removeAccent.js';
import AnnotationSet from '../core/AnnotationSet.js';

/**
 * Generic tokenizer
 * @class nlpjs.tokenizer.Tokenizer
 */
export default class Tokenizer {

    /**
     * @constructor
     */
    constructor() {
        this.capitals = "A-ZĚŠČŘŽÝÁÍÉÚŮ";
        this.sentenceTerminators = "?.!";
        this.abbrs = [];
        this.ignoredCharacters = "0-9 \"?!.,:;()–|/„".split('').concat('\\[', '\\]');
        this.dateRegex = /(?:(?:[1-3][0-9])|(?:0?[1-9]))\.\s*(?:(?:1[0-2])|(?:0?[1-9]))\.(?:\s*[0-9]{4}|[0-9]{2})?/g;
        this.timeRegex = /[1-2]?[0-9]:[0-5][0-9](?::[0-5][0-9])?/g;
        this.durationRegex = /((?:[0-9]+\s*h)?\s*(?:[0-9]+\s*m))(?:\s|[,.!?])/g;
        this.numberRegex = new RegExp('(([-+]?)[0-9]+(?:[/,.-][0-9]+)?)([.:]?)', 'g');
        this.stopWordsList = [];
        this._build();
    }

    /**
     * Generates Regexes from options
     * @private
     */
    _build(){
        var abbrsRegex = this.abbrs.map(function(abb){ return "(?:"+abb+"\\.)"; });
        var sentenceContent = abbrsRegex.concat(["[^"+this.capitals+this.sentenceTerminators+"]","(?:°C)","(?:°F)"]).join('|');
        this.sentenceRegex = new RegExp("(["+this.capitals+"](?:"+sentenceContent+")+(["+this.sentenceTerminators+"]+|$))(?:\\s|["+this.capitals+"]|$)", 'g');
        this.wordRegex = new RegExp('[^'+this.ignoredCharacters.join('')+']+', 'g');
        this.stopWords = l2m(this.stopWordsList);
    }

    /**
     * Tests word on stopword
     * @param word
     * @returns {boolean}
     * @private
     */
    _isStopword(word){
        return !!this.stopWords[removeAccent(word.toLowerCase())];
    }

    /**
     * Complete tokenization of text of the document.
     * @return {nlpjs.tokenizer.Tokenizer} self
     */
    tokenize(document) {
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

    /**
     *
     * @param {nlpjs.core.Document} document document to process
     * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
     */
    stopwords(document){
        document.annotations.type('word').each((word) =>  (this._isStopword(word.text))? word.features.stopword = true: undefined);
        return document;
    }

    /**
     * Creates word tokens
     * @param {nlpjs.core.Document} document document to process
     * @param {boolean} returnTokens returns Annotations instead of document with added annotations
     * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
     */
    words(document, returnTokens) {
        var tokens = [];
        document.text.replace(this.wordRegex, function(word, position){
            tokens.push(AnnotationSet.createAnnotation(position, position + word.length, 'word', {}));
        });
        if (returnTokens)
            return tokens;
        document.annotations.add(tokens);
        return document;
    }

    /**
     * Creates tokens of any numbers within document
     * @param {nlpjs.core.Document} document document to process
     * @param {boolean} returnTokens returns Annotations instead of document with added annotations
     * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
     */
    numbers(document, returnTokens) {
        var tokens = [];
        document.text.replace(this.numberRegex, function(word, number, negation, terminator, position){
            tokens.push(AnnotationSet.createAnnotation(position, position + word.length, 'number', {
                negative : negation == '-',
                terminator : terminator
            }));
        });
        if (returnTokens)
            return tokens;
        document.annotations.add(tokens);
        return document;
    }

    /**
     * Creates tokens of any numbers within document
     * @param {nlpjs.core.Document} document document to process
     * @param {boolean} returnTokens returns Annotations instead of document with added annotations
     * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
     */
    times(document, returnTokens) {
        var tokens = [];
        if (this.dateRegex)
            document.text.replace(this.dateRegex, function(word, position){
                tokens.push(AnnotationSet.createAnnotation(position, position + word.length, 'time', {
                    type : 'date'
                }));
            });
        if (this.timeRegex)
            document.text.replace(this.timeRegex, function(word, position){
                tokens.push(AnnotationSet.createAnnotation(position, position + word.length, 'time', {
                    type : 'time'
                }));
            });
        if (this.durationRegex)
            document.text.replace(this.durationRegex, function(match, word, position){
                tokens.push(AnnotationSet.createAnnotation(position, position + word.length, 'time', {
                    type : 'duration'
                }));
            });
        if (returnTokens)
            return tokens;
        document.annotations.add(tokens);
        return document;
    }

    /**
     * Creates sentence tokens with type of sentence
     * (interrorative, impertative or declarative)
     * @param {nlpjs.core.Document} document document to process
     * @param {boolean} returnTokens returns Annotations instead of document with added annotations
     * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
     */
    sentences(document, returnTokens) {
        var sentence,
            offset,
            line,
            tokens = [],
            annotations = document.annotations,
            self = this;
        document.text.replace(this.sentenceRegex, function(match, sentence, type, position){
            for (var i=0,ii=self.abbrs.length;i<ii;i++){
                if (sentence.indexOf(self.abbrs[i]) == sentence.length-self.abbrs[i].length)
                    return;
            }
            if (type === '?')
                type = 'interrorative';
            else if (type === '!')
                type = 'imperative';
            else
                type = 'declarative';
            offset = match.length - sentence.length - 1;
            sentence = AnnotationSet.createAnnotation(offset + position, offset + position + sentence.length, 'sentence', {type : type});
            // try fix using line
            line = annotations.get(sentence.start, sentence.end).type('line').first;
            if (line){
                if (sentence.start !== line.start){
                    let prev_sentence = tokens[tokens.length-1];
                    if (prev_sentence && prev_sentence.start >= line.start){
                        sentence.start = prev_sentence.end;
                    } else {
                        sentence.start = line.start;
                    }
                }
            }
            tokens.push(sentence);
        });
        if (returnTokens)
            return tokens;
        document.annotations.add(tokens);
        return document;
    }

    /**
     * Creates semantic line tokens, semantic line is text
     * within html tags with semantic of line - text that would
     * be display on screen of infinite width without css as single line.
     * Line doesn't contain other line
     * @param {nlpjs.core.Document} document document to process
     * @param {boolean} returnTokens returns Annotations instead of document with added annotations
     * @returns {nlpjs.core.Document|Array<nlpjs.core.Annotation>}
     */
    lines(document, returnTokens) {
        var tokens = [];
        var tags = {
            p : true,
            li : true,
            tr : true
            /*div: true,
             h1 : true,
             h2 : true,
             h3 : true*/
        };

        var breaks = [];

        document.annotations.type('html').each(function(an){
            if (tags[an.features.element]){
                tokens.push(AnnotationSet.createAnnotation(an.start, an.end, 'line'));
            } else if (an.features.element == 'br'){
                breaks.push(an);
            }
        });

        for(var i=0,ii=breaks.length;i<ii;i++) { // break all paired tags with line break tags
            for(var j=0,jj=tokens.length;j<jj;j++) {
                if (tokens[j].start < breaks[i].start && tokens[j].end > breaks[i].end){
                    tokens.push(AnnotationSet.createAnnotation(breaks[i].end, tokens[j].end, 'line'));
                    tokens[j].end = breaks[i].start;
                    jj++;
                }
            }
        }

        var removed = {};
        tokens = tokens.filter(function(token, j){ // remove lines containing line(s)
            for(var i=0,ii=tokens.length;i<ii;i++) {
                if (i !== j && !removed[i] && token.start <= tokens[i].start && token.end >= tokens[i].end){
                    removed[j] = true;
                    return false;
                }
            }
            return true;
        });

        if (returnTokens)
            return tokens;
        document.annotations.add(tokens);
        return document;
    }

}