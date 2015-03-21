
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
     * @param {object} ruleset list of rules for stemming
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
     * @returns {Array[Array]} groups of colliding rules
     */
    collisions(){
        var collisions = [];
        var rulesetLength = this.ruleset.length;
        for (let i = 0; i < rulesetLength; i+=1){
            for (let j = i+1; j < rulesetLength; j+=1){
                let that  = this.ruleset[i],
                    other = this.ruleset[j];

                if (that.del === other.del){
                    collisions.push([that, other]);
                }
            }
        }
        return collisions;
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
