


var justMatch = function(_, match){
    return match;
};

/**
 * @class Hunspell
 * @memberOf nlpjs.stemmer
 * @property {Array} ruleset
 * @property {{stem: {usage: int, cls: string}}} dict
 * @param {Array<Function>} ruleset list of rules for stemming
 * @example \\ Create Hunspell Stemmer
 * var stemmer = Hunspell.fromAffix(affFileContentAsString);
 * stemmer.dictionary(dictFileContentAsString);
 * stemmer.usage(['lorem', 'ipsum', 'dolor', 'sit', 'amet'])
 * stemmer.removeUnusedRules();
 * stemmer.removeUnusedDictEntries()
 */
export default class Hunspell {


    constructor(ruleset){
        this.ruleset = ruleset;
        this.nextId = 0;
        var rule;
        for (var i = 0, ii = ruleset.length; i < ii; i += 1){
            rule = ruleset[i];
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
        if (word.normalize){
            word = word.normalize();
        }
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
        var index = {},
            rule;
        for (var i = 0, ii = rules.length; i < ii; i += 1){
            rule = rules[i];
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
        var collision;
        for (var i = 0, ii = collisions.length; i < ii; i += 1) {
            collision = collisions[i];
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
        var rule, word;
        for (var i = 0, ii = this.ruleset ? this.ruleset.length : 0; i < ii; i += 1){
            rule = this.ruleset[i];
            rule.usage = rule.usage || 0;
            usage.push(rule);
            for (var j = 0, jj = words ? words.length : 0; j < jj; j += 1){
                word = words[j].toLowerCase().trim();
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
        var lines = dictionary.split('\n'),
            regex = /^(\S+)\/([A-Z]+)$/,
            line;
        this.dict = {};
        for (var i = 0, ii = lines.length; i < ii; i += 1) {
            line = lines[i];
            let match = line.match(regex);
            if (match){
                this.dict[match[1].toLowerCase()] = {
                    cls: match[2]
                };
            }
        }
    }


    /**
     * Serialize current state to json
     * @method nlpjs.stemmer.Hunspell#toJSON
     * @returns {string} json
     */
    toJSON(){
        var dict = "";
        for(var word in this.dict){
            if (this.dict.hasOwnProperty(word)) {
                dict += word + "/" + this.dict[word].cls + "\n";
            }
        }
        var json = {
            r: this.ruleset.map((x) => x.original),
            d: dict
        };
        return JSON.stringify(json);
    }

    /* ***************
     * Static methods
     * ***************/

    static fromJSON(json) {
        return Hunspell.load(JSON.parse(json));
    }

    /**
     * Deserialize fromJSON
     * @method nlpjs.stemmer.Hunspell.fromJSON
     * @param {string} json
     */
    static load(data){
        var ruleset = data.r.map((x) => Hunspell.createRule(x.s, x.d, x.a, x.c));
        var stemmer = new Hunspell(ruleset);
        stemmer.dictionary(data.d);
        return stemmer;
    }

    /**
     * Creates rule from parsed affix file
     * @method nlpjs.stemmer.Hunspell.createRule
     * @param {boolean} suffix true if line starts with SFX
     * @param {string} del second rule param
     * @param {string} add third rule param
     * @param {string} cond fourth rule param
     * @returns {nlpjs.stemmer.Hunspell}
     */
    static createRule(suffix, del, add, cond) {
        var original = {
            s: suffix,
            d: del,
            a: add,
            c: cond
        };
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
        f.suffix = suffix;
        f.add = add;
        f.del = del;
        f.cond = cond;
        f.weight = weight;
        f.original = original;
        return f;
    }

    /**
     * Initialize stemmer from aff file
     * @method nlpjs.stemmer.Hunspell.fromAffix
     * @param {string} content content of aff file
     * @returns {nlpjs.stemmer.Hunspell}
     * @example
     * var content = \
     * "SFX P   0           a          [^aeokl]\
     *  SFX P   0           u          [^aeoklu]\
     *  SFX P   0           ovi        [^aeokl]";
     *  var hunspell = Hunspell.fromAffix(content);
     */
    static fromAffix(content){
        var lines = content.split('\n');
        var regex = /(SFX|PFX)\s+([A-Z])\s+([A-Z])?\s+(\S+)\s+(\S+)\s+(.+)$/;
        var rules = [];
        var line;
        for(var i = 0, ii = lines ? lines.length : 0; i < ii; i += 1){
            line = lines[i].split('#')[0].trim();
            let match = line.match(regex);
            if (match) {
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
