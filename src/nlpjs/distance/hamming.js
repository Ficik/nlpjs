/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */

export default class Hamming {

    /**
     * Calculates Hamming distance
     * @name nlpjs.distance.Hamming.distance
     * @param {string} string1
     * @param {string} string2
     * @returns {number|undefined} hamming distance or undefined for string of different lengths
     */
    static distance(string1, string2) {

        if (string1.length !== string2.length){
            return;
        }

        string1 = string1.toString();
        string2 = string2.toString();

        var distance = 0;
        for (var i = 0, ii = string1.length; i < ii; i += 1){
            if (string1[i] !== string2[i]){
                distance += 1;
            }
        }

        return distance;
    }
}