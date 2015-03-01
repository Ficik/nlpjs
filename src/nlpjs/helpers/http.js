define(function(){

	var http = function(method, url, data){
		var xhr = new XMLHttpRequest();
		var promise = new Promise(function(resolve, reject){
			xhr.onreadystatechange = function() {
			    if (xhr.readyState === 4){
			    	if (xhr.status/100 == 2) {
			    		resolve(xhr.responseText, xhr);
			    	} else {
			    		reject(xhr);
			    	}
			    }
			};
		});
		xhr.open(method, url);
		xhr.send(data||null);
		return promise;
	};

	http.get = function(url){
		return http('GET', url);
	};

	return http;

});