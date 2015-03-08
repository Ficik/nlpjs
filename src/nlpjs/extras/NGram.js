define(['nlpjs/helpers/http'], function(http){


	var NGram = {};
	/**
	 * N-gram frequency analysis
	 * @method
	 * @name nlpjs.extras.NGram#ngram
	 * @param  {number} n smallest ngram size
	 * @param  {number} [m] larges ngram size, if not provided equals to n
	 * @return {object}   ngram frequencies
	 * @example ngrams(1) // returns letters frequencies
	 *  ngrams(2,3) // returns bi-grams and tri-grams
	 */
	NGram.ngrams = function(document, n, m){
		if (m === undefined)
			m = n;

		var dict = {},
			buffer = [],
			word,
			i = 0,
			text = document.text.replace(/(\s|[.,!?])+/g,'_') // replace punctuation with _
						    .replace(/[0-9()°|><-]/g,'') // remove
						    .toLowerCase()
						    .split('');

		for (;n<=m;n++){
			for(i=0;i<text.length;i++) {
				buffer.push(text[i]);
				if (buffer.length == n){
					word = buffer.join('');
					dict[word] = (dict[word] || 0) + 1;
					buffer.shift();
				}
			}
		}
		return dict;
	};


	/**
	 * N-gram frequency analysis with
	 * frequency statistics, counts and rank
	 * @return {Object[]} with keys f, w, r, c
	 */
	NGram.stats = function(document, n, m) {
		var ngrams = this.ngrams(document, n, m);
		var arr = [];
		for (var ngram in ngrams){
			arr.push({
				c : ngrams[ngram],
				w : ngram
			});
		}
		arr.sort(function(a,b) {
			return (a.c > b.c) ? -1 : ((a.c < b.c) ? 1 : 0);
		});

		var totalCount = arr.reduce(function(sum, ngram) { return sum + ngram.c; }, 0);
		if (totalCount < 1)
			totalCount = 1;

		for (var i=0; i<arr.length; i++) {
			arr[i].f = arr[i].c/totalCount;
			arr[i].r = i;
		}
		return arr;
	};

	NGram.compare = function(document, top, n, m) {
		var thisNgrams = this.stats.apply(this, [document, n, m]).slice(0, top);
		var self = this;
		return function(){
			return Array.prototype.slice.call(arguments, 0).map(function(ngrams){
				var reverseIndex = {};

				ngrams = ngrams.slice(0,top);
				for (var i=0;i<ngrams.length;i+=1) {
					reverseIndex[ngrams[i].w] = ngrams[i];
				}
				return self._ngramScore(thisNgrams, reverseIndex);
			});
		};
	};

	NGram._ngramScore = function(ngrams, reverseIndex) {
		var distance = 0;
		var max = Object.keys(reverseIndex).length;
		var penalties = [];
		for (var i=0;i<ngrams.length;i+=1) {
			var gram = ngrams[i];
			var model = reverseIndex[gram.w];
			penalty = (model === undefined) ? max : Math.abs(gram.r - model.r);
			penalties.push(penalty);
			distance += penalty;
		}
		return distance/ngrams.length;
	};

	NGram.export = function(data, top){
		top = top || 300;
		var exp = {};
		for (var key in data){
			exp[key] = data[key].slice(0, top).map(function(x){
				return x.w;
			}).join('|');
		}
		return JSON.stringify(exp);
	};

	NGram.import = function(json){
		var exp = {};
		var data = (typeof(json) === 'string') ? JSON.parse(json) : json;
		for (var key in data){
			if (data.hasOwnProperty(key))
				exp[key] = data[key].split('|').map(function(x, i){
					return { w: x, r: i };
				});
		}
		return exp;
	};

	NGram.importUrl = function(url){
		return http.get(url).then(function(x){
			return NGram.import(x);
		});
	};

	return NGram;

});