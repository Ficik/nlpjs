/**
 * List to map
 * @param {Array} list
 * @param {string} [key]
 * @returns {{}}
 */
export function l2m(list, key){
    var hasKey = (typeof(key) === 'string');
    var map = {};
    for (var i=0, ii=list.length; i<ii; i++){
        if(hasKey){
            map[list[i][key]] = list[i];
        } else {
            if (key){
                map[list[i]] = {v : list[i]};
            } else {
                map[list[i]] = list[i];
            }
        }
    }
    return map;
}

/**
 * @class StringBuffer
 */
export class StringBuffer {

    constructor(str) {
        this.str = str || '';
    }

    length() {
        return this.str.length;
    }

    substring(a, b) {
        return new StringBuffer(this.str.substring(a, b));
    }

    toString() {
        return this.str;
    }

    equals(x) {
        return this.str === x;
    }

    insert(i, s) {
        this._splice(i, 0, s);
    }

    delete(a, b) {
        this._splice(a, b-a);
    }

    replace(a, b, s) {
        this._splice(a, b-a, s);
    }

    _splice() {
        var characterArray = this.str.split( "" );
        Array.prototype.splice.apply(characterArray, arguments);
        this.str = characterArray.join( "" );
    }

    charAt(i) {
        return this.str[i];
    }
}