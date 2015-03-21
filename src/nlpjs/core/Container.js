export default class Container {

    /**
     * Generic data container
     * @constructor
     * @name nlpjs.core.Container
     * @param {string} name name of the container
     */
    constructor(name){
        this._name = name;
    }

    /**
     * Descriptive name of this Container
     * @readonly
     * @memberof nlpjs.core.Container
     * @name nlpjs.core.Container#name
     * @type {string}
     */
    get name(){
        return this._name;
    }
}
