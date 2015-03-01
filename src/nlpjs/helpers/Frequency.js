define(['nlpjs/helpers/listtomap'], function(l2m){

  var Frequency = {
    calculate : function(list, top){
      var dict = {};
      var total = 0;
      for(var i=0, ii=list.length; i<ii; i++){
        var token = list[i];
        if (dict[token] === undefined){
          dict[token] = {
            c : 0,
            v : list[i]
          };
        }
        dict[token].c += 1;
        total += 1;
      }
      var list = [];
      for(var key in dict){
        if (dict.hasOwnProperty(key)){
          dict[key].f = (dict[key].c) / total;
          list.push(dict[key]);
        }
      }
      list = list.sort(function(a,b){ return b.c - a.c });
      if (top === undefined)
        return list;
      list = list.slice(0, top);
      return this.recalculate(list);
    },

    recalculate : function(list){

      total = list.reduce(function(sum, nxt){ return sum + nxt.c; }, 0);
      for(var i=0, ii=list.length; i<ii; i++){
          list[i].f = list[i].c / total;
      }
      return list;
    },

    filter : function(){
      var args = Array.prototype.slice.call(arguments, 0);
      var fn = args.pop();
      var arr = args.shift();
      var result = [];
      var dicts = args.map(function(x){ return l2m(x, 'v')});
      for(var i=0, ii=arr.length; i<ii; i++){
        var cmp = dicts.map(function(dict){
          if (dict[arr[i].v] !== undefined)
            return dict[arr[i].v].f;
          return 0;
        });
        cmp.unshift(arr[i].f);
        if (fn.apply(this, cmp)){
          result.push(arr[i]);
        }
      }

      return result;
    }
  };
  return Frequency;
});
