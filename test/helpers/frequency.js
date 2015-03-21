require(['nlpjs/helpers/Frequency'], function(Frequency){
    describe('Frequency helper', function(){

      var list = ['a', 'aa', 'ab', 'a', 'aa', 'aa', 'ac'];
      var list2 = ['a', 'aa', 'aa', 'bb'];

      it('should be an object', function(){
          Frequency.should.be.an.Object.with.properties('calculate', 'recalculate', 'filter');
      });

      it('should return list of right objects', function(){
          var result = Frequency.calculate(list);
          result.should.have.length(4);
          result[0].should.be.an.Object.with.properties('c', 'f', 'v');
      });

      it('should return sorted list by frequency', function () {
        var result = Frequency.calculate(list);
        result[0].v.should.be.exactly('aa');
        result[0].c.should.be.exactly(3);
        result[0].f.should.be.exactly(3.0/7.0);
      });

      it('should return top n items with corrected frequencies', function(){
        var result = Frequency.calculate(list, 2);
        result.should.have.length(2);
        result[0].f.should.be.exactly(3.0/5.0);
      });

      it('should allow recalculation of frequencies', function(){
        var list = [
          {v : 'a', f:0, c :4},
          {v : 'b', f:0, c :1}
        ];
        list = Frequency.recalculate(list);
        list[0].f.should.be.exactly(0.8);
        list[1].f.should.be.exactly(0.2);
      });

      it('should allow zip filtering', function(){
        var freqs = Frequency.calculate(list);
        var result = Frequency.filter(freqs, Frequency.calculate(list2), function(fg, bg){
          return fg > bg;
        });
        result.map(function(x){ return x.v; }).sort().join(',').should.be.exactly('a,ab,ac');
      });
    });
});
