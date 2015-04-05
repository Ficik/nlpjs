export default class Container {

    /**
     * Generic data container
     * @class nlpjs.core.Container
     * @param {string} name name of the container
     * @property {string} name
     */
    constructor(name){
        this._name = name;
    }

    /**
     * @readonly
     * @returns {Container.name}
     */
    get name(){
        return this._name;
    }
}
