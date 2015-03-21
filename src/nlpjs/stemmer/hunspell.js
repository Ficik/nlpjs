
var justMatch = function(_, match){
    return match;
};
/**
 * @class
 * @name nlpjs.stemmer.Hunspell
 * @property {Array} ruleset
 */
export default class Hunspell {

    /**
     * @constructor
     * @name nlpjs.stemmer.Hunspell
     * @param {Array<Function>} ruleset list of rules for stemming
     */
    constructor(ruleset){
        this.ruleset = ruleset;
    }

    /**
     * creates stem from word
     * @name nlpjs.stemmer.Hunspell#stem
     * @param {string} word
     * @returns {string}
     */
    stem(word) {
        word = word.toLowerCase().trim();
        for (let i = 0, ii = this.ruleset.length; i < ii; i += 1){
            let rule = this.ruleset[i];
            if (rule){
                let w = rule(word);
                if (w) {
                    word = w;
                    break;
                }
            }
        }
        return word;
    }

    /**
     * Detects colliding rules
     * @name nlpjs.stemmer.Hunspell#collisions
     * @returns {Array<Array<Function>>} groups of colliding rules
     */
    collisions(){
        var collisions = [];
        var rulesetLength = this.ruleset.length;
        for (let i = 0; i < rulesetLength; i+=1){
            for (let j = i+1; j < rulesetLength; j+=1){
                let that  = this.ruleset[i],
                    other = this.ruleset[j];

                if (that.add === other.add && (
                        that.cond.toString().replace(that.del + '$', '') ===
                        other.cond.toString().replace(other.del + '$', '')
                    )){
                    collisions.push([that, other]);
                }
            }
        }
        return collisions;
    }

    /**
     * Calculates usage of rules on provided words
     * @param {Array<String>} words list of words to test
     * @returns {Array<Function>} sorted list of function with addition usage parameter
     */
    usage(words){
        var usage = [];
        for(let rule of this.ruleset){
            rule.usage = rule.usage || 0;
            usage.push(rule);
            for (let word of words){
                if (rule(word)){
                    rule.usage += 1;
                }
            }
        }
        usage.sort(function(a, b){
            return b.usage - a.usage;
        });

        return usage;
    }

    /**
     * Change order of rules
     */
    resort(){
        this.ruleset.sort(function(a, b){
            return b.usage - a.usage;
        });
    }

    /* ***************
     * Static methods
     * ***************/

    /**
     * @name nlpjs.stemmer.Hunspell.createRule
     * @returns {nlpjs.stemmer.Hunspell}
     */
    static createRule(suffix, del, add, cond) {
        var rule, weight;
        var d = parseInt(del);
        if (!isNaN(d)) {
            del = "";
        }

        weight = add.length;

        if (suffix){
            rule = new RegExp(`^(.{2,})${add}$`);
            cond = new RegExp(`^.{2,}${cond}$`);
        } else {
            rule = new RegExp(`^${add}(.{2,})$`);
            cond = new RegExp(`^${cond}.{2,}$`);
        }
        var f = function(word){
            if (word.match(rule)){
                var stem = word.replace(rule, justMatch) + del;
                if (stem && stem.match(cond)){
                    return stem;
                }
            }
            return null;
        };
        f.add = add;
        f.del = del;
        f.cond = cond;
        f.weight = weight;
        return f;
    }

    /**
     * @name nlpjs.stemmer.Hunspell.fromAffix
     * @param {string} content
     * @returns {nlpjs.stemmer.Hunspell}
     */
    static fromAffix(content){
        var lines = content.split('\n');
        var regex = /(SFX|PFX)\s+([A-Z])\s+([A-Z])?\s+(\S+)\s+(\S+)\s+(.+)$/;
        var rules = [];
        for (let line of lines) {
            let match = line.match(regex);
            if (match){
                let type = match[1];
                let del = match[4];
                let add = match[5];
                let con = match[6];
                let rule;
                rules.push(Hunspell.createRule(type === 'SFX', del, add, con));
            }
        }
        rules = rules.sort((a,b) => b.weight - a.weight);
        return new Hunspell(rules);
    }

}
