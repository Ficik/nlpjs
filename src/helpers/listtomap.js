define(function(){
    return function(list, key){
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
    };
});
