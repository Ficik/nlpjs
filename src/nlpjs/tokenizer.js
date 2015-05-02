/**
 * @namespace nlpjs.tokenizer
 */

import Tokenizer from './tokenizer/Tokenizer.js';
import CsTokenizer from './tokenizer/CsTokenizer.js';
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