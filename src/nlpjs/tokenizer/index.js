/**
 * @namespace nlpjs.tokenizer
 */

import Tokenizer from './tokenizer.js';
import CsTokenizer from './tokenizer.cs.js';
export { Tokenizer, CsTokenizer };

/**
 * Return suitable tokenizer
 * @param language
 */
export default function getTokenizer(language){
    if (language === 'cs'){
        return CsTokenizer;
    }
    return Tokenizer;
}