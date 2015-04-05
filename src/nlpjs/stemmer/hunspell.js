
var justMatch = function(_, match){
    return match;
};
export default class Hunspell {

    /**
     * @class nlpjs.stemmer.Hunspell
     * @property {Array} ruleset
     * @property {{stem: {usage: int, cls: string}}} dict
     * @constructor
     * @param {Array<Function>} ruleset list of rules for stemming
     */
    constructor(ruleset){
        this.ruleset = ruleset;
        this.nextId = 0;
        for (let rule of ruleset){
            rule.id = this.nextId++;
        }
    }

    /**
     * creates stem from word
     * @method nlpjs.stemmer.Hunspell#stem
     * @param {string} word
     * @param {boolean} useDict use dictionary if available
     * @returns {string}
     */
    stem(word, useDict = true) {
        word = word.toLowerCase().trim();
        var w;
        // use dictionary if available and word is in dict
        if (this.dict && useDict) {
            if (this.dict[word]){
                return word;
            }
            for (let i = 0, ii = this.ruleset.length; i < ii; i += 1) {
                let rule = this.ruleset[i];
                if (rule) {
                    w = rule(word);
                    if (w && this.dict[w] && this.dict[w].cls.match(rule.cls)) {
                        return w;
                    }
                }
            }
        }
        // otherwise use first matching rule
        for (let i = 0, ii = this.ruleset.length; i < ii; i += 1){
            let rule = this.ruleset[i];
            if (rule){
                w = rule(word);
                if (w) {
                    return w;
                }
            }
        }
        return word;
    }

    /**
     * Detects colliding rules
     * @method nlpjs.stemmer.Hunspell#collisions
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
     * @method nlpjs.stemmer.Hunspell#removeRules
     * @param {Array<Number>|Array<{id:Number}>}rules
     */
    removeRules(rules){
        var index = {};
        for (let rule of rules) {
            index[rule.id || rule] = true;
        }
        this.ruleset = this.ruleset.filter(function(x){
            return !index[x.id];
        });
    }


    /**
     * Removes colliding rules based on their usage
     * @method nlpjs.stemmer.Hunspell#removeCollidingRules
     */
    removeCollidingRules(){
        var collisions = this.collisions();
        var remove = [];
        for (let collision of collisions) {
            remove.push(collision[0].usage > collision[1].usage ? collision[1] : collision[0]);
        }
        this.removeRules(remove);
    }

    /**
     * Removes rules with usage below threshold
     * @method nlpjs.stemmer.Hunspell#removeUnusedRules
     * @param {number} threshold default is 0
     */
    removeUnusedRules(threshold = 0){
        this.ruleset = this.ruleset.filter(function(x){
            return x.usage > threshold;
        });
    }

    /**
     * Removes dict entries with usage below threshold
     * @method nlpjs.stemmer.Hunspell#removeUnusedDictEntries
     * @param {number} threshold default is 0
     */
    removeUnusedDictEntries(threshold = 0){
        var counter = 0;
        for (let key in this.dict){
            if (this.dict.hasOwnProperty(key)) {
                if ((this.dict[key].usage || 0) <= threshold) {
                    delete(this.dict[key]);
                    counter+=1;
                }
            }
        }
        return counter;
    }


    /**
     * Calculates usage of rules on provided words
     * @method nlpjs.stemmer.Hunspell#usage
     * @param {Array<String>} words list of words to test
     * @param {boolean} sort sort returned statistic by usage
     * @returns {Array<Function>} sorted list of function with addition usage parameter
     */
    usage(words, sort=false){
        var usage = [];
        for(let rule of this.ruleset){
            rule.usage = rule.usage || 0;
            usage.push(rule);
            for (let word of words){
                word = word.toLowerCase().trim();
                if (this.dict && this.dict[word]) {
                    if (!this.dict[word].usage) {
                        this.dict[word].usage = 1;
                    } else {
                        this.dict[word].usage += 1;
                    }
                } else {
                    var w = rule(word);
                    if (this.dict && w) { // use dictionary if available
                        if (this.dict[w] && this.dict[w].cls.match(rule.cls)) {
                            rule.usage += 1;
                            if (!this.dict[w].usage) {
                                this.dict[w].usage = 1;
                            } else {
                                this.dict[w].usage += 1;
                            }
                        }
                    } else if (w) {
                        rule.usage += 1;
                    }
                }
            }
        }
        if (sort) {
            usage.sort(function (a, b) {
                return b.usage - a.usage;
            });
        }

        return usage;
    }

    /**
     * Change order of rules
     * @method nlpjs.stemmer.Hunspell#resort
     */
    resort(){
        this.ruleset.sort(function(a, b){
            var w = b.weight - a.weight;
            return w !== 0 ? w :b.usage - a.usage;
        });
    }

    /**
     * Hunspell dic file parser
     * @method nlpjs.stemmer.Hunspell#dictionary
     * @param dictionary
     */
    dictionary(dictionary){
        var lines = dictionary.split('\n');
        var regex = /^(\S+)\/([A-Z]+)$/;
        this.dict = {};
        for (let line of lines) {
            let match = line.match(regex);
            if (match){
                this.dict[match[1].toLowerCase()] = {
                    cls: match[2]
                };
            }
        }
    }

    /* ***************
     * Static methods
     * ***************/

    /**
     * @method nlpjs.stemmer.Hunspell.createRule
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
     * @method nlpjs.stemmer.Hunspell.fromAffix
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
                let cls = match[2];
                let del = match[4];
                let add = match[5];
                let con = match[6];
                let rule = Hunspell.createRule(type === 'SFX', del, add, con);
                rule.cls = cls;
                rules.push(rule);
            }
        }
        rules = rules.sort((a,b) => b.weight - a.weight);
        return new Hunspell(rules);
    }

}
