/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */
/**
 * Set of tools for quering SPARQL endpoints
 * @namespace nlpjs.db.sparql
 * @memberOf nlpjs.db
 */


/**
 * @class Query
 * @memberOf nlpjs.db.sparql
 * @param {string} query query to perform
 * @property {string} query query to perform
 * @property {object} prefixes prefixes available to the query
 * @description
 * Sparql query wrapper.
 * For now just simplifies prefix management, by allowing setting prefixes separatelly from query
 * @example //Create query with prefixes
 * var query = new Query();
 * query.prefixes['dbpprop'] = 'http://dbpedia.org/property/';
 * query.prefixes['unused'] = 'http://unused/';
 * query.query = "prefix dbpedia: <http://dbpedia.org/resource/> \
 *                Select ? name Where { dbpedia:SPARQL dbpprop:name ?name.}";
 * var built = query.toString();
 * // => prefix dbpedia: <http://dbpedia.org/resource/>
 * //    prefix dbpprop: <http://dbpedia.org/property/>
 * //    Select ? name Where { dbpedia:SPARQL dbpprop:name ?name.}
 */
export class Query {

    constructor(query){
        this._query = query;
        this.prefixes = {};
    }

    set query(query){
        var prefixes = this.prefixes;
        this._query = query.replace(/prefix\s+([^:]+):\s+<([^>]+)>$/g, function(match, prefix, url){
            prefixes[prefix] = url;
            return '';
        });
        return query;
    }

    get query(){
        return this._query;
    }

    /**
     * Builds query to string
     * @name nlpjs.db.sparql.Query#toString
     * @return {string}
     */
    toString(){
        var query = '';
        var usedPrefixes = {};

        this.query.replace(/(\S+):(\S+)/g, function(match, prefix, value){
            usedPrefixes[prefix] = true;
        });

        for (var prefix in this.prefixes) {
            if(this.prefixes.hasOwnProperty(prefix) && usedPrefixes[prefix]){
                query += `prefix ${prefix}: <${this.prefixes[prefix].replace(/^<|>$/g, '')}>\n`;
            }
        }

        query += this.query;
        return query;
    }
}

/**
 * @class Endpoint
 * @memberOf nlpjs.db.sparql
 * @property {string} url
 * @property {boolean} jsonp - Whether query should be done using jsonp (currently only supported method)
 * @param {string} url query template with %query% placeholder for query
 * @param {boolean} jsonp use jsonp for quering
 * @description
 * Sparql enpoint wrapper.
 * Allows to query the endpoint at defined url and provides access to endpoint customized Query object
 */
export default class Endpoint {


    constructor(url, jsonp = true){
        this.url = url;
        this.jsonp = jsonp;
    }

    /**
     * @method nlpjs.db.sparql.Endpoint.query
     * @param {nlpjs.db.sparql.Query|string}  query
     * @returns {Promise<json>} promise of json formated result
     */
    query(query){
        query = this._sanitizeQuery(query.toString());
        if (this.jsonp) {
            return this._doJSONP(this.url.replace('%query%', query));
        }
    }

    /**
     * Transform query to get parameter encoding
     * @method nlpjs.db.sparql.Endpoint._sanitizeQuery
     * @param query
     * @private
     * @returns {string}
     */
    _sanitizeQuery(query){
        return encodeURIComponent(query)
            .replace(/%20/g, '+')
            .replace(/\++/g, '+');
    }


    /**
     * Do jsonp request
     * @method nlpjs.db.sparql.Endpoint._doJSONP
     * @param url
     * @returns {Promise}
     * @private
     */
    _doJSONP(url){
        var self = this;
        return new Promise(function(resolve, error){
            var script = document.createElement('script');
            var callbackName = self._createSafeCallback(function(data) {
                document.head.removeChild(script);
                resolve(data);
            });
            script.src = `${url}&callback=${callbackName}`;
            script.onerror = error;
            document.head.appendChild(script);
        });
    }

    /**
     * Endpoint customized query object
     * @method nlpjs.db.sparql.Endpoint.getQuery
     * @return {nlpjs.db.sparql.Query}
     */
    getQuery(){
        return new Query();
    }

    /**
     * @method nlpjs.db.sparql.Endpoint._createSafeCallback
     * @param fn
     * @private
     */
    _createSafeCallback(fn){
        var name = `sparql${Date.now()}${Math.floor(Math.random()*100)}`;
        window[name] = function(data){
            fn(data);
            delete(window[name]);
        };
        return name;
    }

}

/**
 * dbpedia.org endpoint wrapper
 * @class DBPediaEndpoint
 * @memberOf nlpjs.db.sparql
 * @param {string} lang language mutation of enpoint. Two letter codes are expected
 * @extends Endpoint
 */
export class DBPediaEndpoint extends Endpoint {

    /**
     *
     */
    constructor(lang){
        if (lang){
            super(`http://${lang}.dbpedia.org/sparql?query=%query%&format=application%2Fjson`, true);
        } else {
            super(`http://dbpedia.org/sparql?query=%query%&format=application%2Fjson`, true);
        }
    }

    /**
     * Query with preset commonly used prefixes on dbpedia
     * @method nlpjs.db.sparql.DBPediaEndpoint.getQuery
     * @returns {nlpjs.db.sparql.Query}
     */
    getQuery(){
        var query = super.getQuery();
        query.prefixes.dbpedia        = 'http://dbpedia.org/resource/';
        query.prefixes['dbpedia-owl'] = 'http://dbpedia.org/ontology/';
        query.prefixes.dbpprop        = 'http://dbpedia.org/property/';
        return query;
    }

}