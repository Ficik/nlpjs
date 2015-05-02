/**
 * @author Stanislav Fifik <stanislav.fifik@designeo.cz>
 */
require(['nlpjs/db/sparql'], function(Sparql){

    var SparqlEndpoint = Sparql.default;
    var SparqlQuery = Sparql.Query;
    var DBPediaSparqlEndpoint = Sparql.DBPediaEndpoint;


    describe('DBpediaSparqlEndpoint', function(){

        it('should fetch page about SPARQL in english', function(cb){
            this.timeout = 5000;
            var dbpedia = new DBPediaSparqlEndpoint();
            dbpedia.query(`
            prefix dbpedia: <http://dbpedia.org/resource/>
            prefix dbpedia-owl: <http://dbpedia.org/ontology/>
            prefix dpprop: <http://dbpedia.org/property/>
                Select ?name
                Where {
                  dbpedia:SPARQL dbpprop:name ?name.
                }
            `).then(function(data){
                data.results.bindings[0].name.value.should.be.exactly('SPARQL');
                cb();
            }).catch(function(reason){
                cb(reason);
            });
        });

        it('should create SPARQL query', function(){
            var dbpedia = new DBPediaSparqlEndpoint();
            var query = dbpedia.getQuery();
            query.prefixes['dbpedia'] = 'http://dbpedia.org/resource/';
            query.prefixes['unused'] = 'http://unused/';
            query.query = "Select ? name Where { dbpedia:SPARQL dbpprop:name ?name.}";
            var built = query.toString();
            built.should.containEql('prefix dbpedia: <http://dbpedia.org/resource/>');
            built.should.containEql('prefix dbpprop: <http://dbpedia.org/property/>');
            built.should.not.containEql('prefix unused:');
            built.should.containEql('dbpedia:SPARQL dbpprop:name ?name.');
        });

        it('should fetch page about SPARQL in english using Query object', function(cb){
            this.timeout = 5000;
            var dbpedia = new DBPediaSparqlEndpoint();
            var query = dbpedia.getQuery();
            query.query = `
                Select ?name
                Where {
                  dbpedia:SPARQL dbpprop:name ?name.
                }
            `;
            dbpedia.query(query).then(function(data){
                data.results.bindings[0].name.value.should.be.exactly('SPARQL');
                cb();
            }).catch(function(reason){
                cb(reason);
            });
        });
    });
});