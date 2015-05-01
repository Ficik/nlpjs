/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */

/**
 *  @class nlpjs.distance.Levenshtein
 *  @property {number} add cost of character insertion
 *  @property {number} del cost of character removal
 *  @property {number} edit cost of character substitution
 *  @describe weighted Levenshtein/edit distance
 *  Default weights are all eq to 1
 */
export default class Levenshtein {

    /**
     * @param {number} add cost of character insertion
     * @param {number} del cost of character removal
     * @param {number} edit cost of character substitution
     */
    constructor(add =1, del = 1, edit = 1){
        this.add =  add;
        this.del =  del;
        this.edit = edit;
    }

    /**
     * Computes Levenshtein distance of two strings
     * @method nlpjs.distance.Levenshtein#distance
     * @param {string} string1
     * @param {string} string2
     * @returns {number}
     */
    distance(string1, string2){
        string1 = string1.toString();
        string2 = string2.toString();

        if (string1 == string2) { // string looks same
            return 0;
        }
        if (string1.length === 0){
            return string2.length * this.add;
        }

        if (string2.length === 0){
            return string1.length * this.del;
        }

        var vec1 = Array.apply(null, new Array(string2.length + 1)).map((x, i) => i * this.del),
            vec2 = [];

        for (var i = 0, ii = string1.length; i < ii; i += 1){
            vec2[0] = (i + 1) * this.add;

            for (var j = 0, jj = string2.length; j < jj; j += 1){
                var cost = (string1[i] === string2[j]) ? 0 : this.edit;
                vec2[j + 1] = Math.min(vec2[j] + this.del, vec1[j + 1] + this.add, vec1[j] + cost);
            }

            vec1 = vec2;
            vec2 = [];
        }

        return vec1[string2.length];
    }

    /**
     * Computes Levenshtein distance of two strings with default weights
     * @method nlpjs.distance.Levenshtein.distance
     * @param {string} string1
     * @param {string} string2
     * @static
     * @returns {number}
     */
    static distance(string1, string2){
        return (new Levenshtein()).distance(string1, string2);
    }

}