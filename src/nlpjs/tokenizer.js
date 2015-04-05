import Tokenizer from './tokenizer/Tokenizer.js';
import CsTokenizer from './tokenizer/CsTokenizer.js';

export {
    Tokenizer as Tokenizer
    CsTokenizer as CsTokenizer
};

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