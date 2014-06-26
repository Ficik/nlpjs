goog.provide('nlpjs.core.Language');
goog.require('nlpjs.core.Document');

goog.scope(function() {

	var DocumentProto = nlpjs.core.Document.prototype;

	var Language = nlpjs.core.Language;

	Language.mixin = Language.mixin||{};


	Language.mixin.language = function(model, threshold) {
		var names  = [],
			models = [];
		for (key in model){
			names.push[key];
			models.push(model[key]);
		}
		threshold = threshold || 150;
		// TODO: detect n in ngram model
		var languages = nlpjs.extras.NGram.mixin.ngramsCompare(2,3)(models);
		languages = languages.map(function(x, i){
			return {
				name : names[i],
				score: x
			};
		}).filter(function(x){
			return x.score < threshold;
		});
		return languages.sort(function(a,b){
			return a.score - b.score;
		});
	};
});