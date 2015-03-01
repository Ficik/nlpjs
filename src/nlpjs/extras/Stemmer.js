define(['klass/klass', 'require'], function(klass, require){

	var Stemmer = {
		get: function(lang, async){
			if (async === false){
				var stemmer = require('nlpjs/extras/stemmer/' + lang);
				return new stemmer();
			} else {
				return new Promise(function(resolve, reject){
					require(['nlpjs/extras/stemmer/' + lang], function(stemmer){
						resolve(new stemmer());
					}, function(err){
						reject(err);
					});
				});
			}
		}
	};

	Stemmer.abstract = klass(function(language){
			this._language = language;
		})
		.methods({
			stem : function(document, type){
				type = type || 'word';
				var self = this;
				var text = document.text;
				var words = document.annotations.type(type);
				words.each(function(word){
					var w = text.slice(word.start, word.end);
					word.features['stem'] = self._stem(w);
				});
			}
		});
	Object.defineProperty(Stemmer.abstract.prototype, 'language', {
		get : function(){
			return this._language;
		}
	});

	return Stemmer;
});
