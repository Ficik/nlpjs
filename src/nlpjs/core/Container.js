export default class Container {

    /**
     * Generic data container
     * @class Container
     * @memberOf nlpjs.core
     * @param {string} name name of the container
     * @property {string} name
     */
    constructor(name){
        this._name = name;
    }

    /**
     * @readonly
     * @returns {string}
     */
    get name(){
        return this._name;
    }
}
