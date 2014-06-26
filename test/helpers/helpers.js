require(['nlpjs/helpers/listtomap'], function(list2map){

    describe('Helper',function(){

        it('listtomap should create map from list', function(){
            var list = ['a', 'b', 'c', 'a'];
            var map = list2map(list, true);
            map.should.have.properties('a', 'b', 'c');
            map.a.should.have.property('v', 'a');
        });

        it('listtomap should create map from list by key', function(){
            var list = [{v : 'a'}, {v : 'b'}, {v : 'c', foo : 'bar'}];
            var map = list2map(list, 'v');
            console.log(map);
            map.should.have.properties('a', 'b', 'c');
            map.c.should.have.property('foo', 'bar');
        });

    });

});
