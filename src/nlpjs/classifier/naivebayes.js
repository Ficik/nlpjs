export default class NaiveBayes {

    /**
     * @class nlpjs.classifier.NaiveBayes
     * @classdesc Naive Bayes classifier
     * @property {object} _model occurences of features
     * @property {object} _classes occurences of classes
     * @property {number} _unique_features number of unique features
     */
    constructor(model={}, classes=undefined, unique_features = 0){
        this._model = model;
        this._unique_features = unique_features;
        if (classes){
            this._classes = classes;
        } else {
            this._classes = {};
        }
    }

    /**
     * Classify group of features
     * @method nlpjs.classifier.NaiveBayes#classify
     * @param {Array} features set of features of object being classified
     * @return {*} class of assign to these features
     */
    classify(features, priors={}){
        var probabilities = this.probabilities(features, priors);
        var mostLikelyClass = null, bestValue = 0;
        for (let key in probabilities){
            if (probabilities.hasOwnProperty(key)){
                if (probabilities[key] > bestValue){
                    mostLikelyClass = key;
                    bestValue = probabilities[key];
                }
            }
        }
        return mostLikelyClass;
    }

    /**
     * Probabilities of feature belonging to class for each known classes
     * @method nlpjs.classifier.NaiveBayes#probabilities
     * @param {*} features
     * @param {number} prior force prior probability
     */
    probabilities(features, priors={}){
        var probabilities = {};
        for (let cls in this._classes){
            if (this._classes.hasOwnProperty(cls) && cls !== 'total') {
                probabilities[cls] = priors[cls]||(this._classes[cls].docs || 0) / (this._classes.total || 1);
                for (let feature of features) {
                    probabilities[cls] *= this.classProbability(cls, feature);
                }
            }
        }
        return probabilities;
    }


    /**
     * Probability of feature belonging to class cls
     * (feature_occurences_in_class + 1)/(all_features_occurrences_in_class + unique_features)
     * @method nlpjs.classifier.NaiveBayes#classProbability
     * @param {string} cls class
     * @param feature classified feature
     * @return {number} probability of feature belonging to class
     */
    classProbability(cls, feature){
        var model = (this._model[feature]||{});
        return ((model[cls]||0) + 1) / ((this._classes[cls].features || 0) + this._unique_features);
    }

    /**
     * Trains bayes model from provided data
     * @method nlpjs.classifier.NaiveBayes#train
     * @param {object.<string,*>} data object with class as key and array of features as value
     */
    train(data){
        for(let cls in data){
            if (data.hasOwnProperty(cls)){
                this.addClassifiedOccurrences(cls, data[cls]);
            }
        }
    }

    /**
     * Train single document with feature occurrences
     * @method @name nlpjs.classifier.NaiveBayes#addClassifiedOccurrences
     * @param {string} cls class document belongs to
     * @param {Array} featureSet list of feature that occurred
     */
    addClassifiedOccurrences(cls, featureSet){
        var feature;
        if (!this._classes[cls])
            this._classes[cls] = {};
        for (var i=0, ii = featureSet.length; i<ii; i++) {
            feature = featureSet[i];
            if (!this._model[feature]) {
                this._model[feature] = {};
                this._unique_features += 1;
            }
            //this._model[feature].total = (this._model[feature].total || 0) + 1;
            this._model[feature][cls] = (this._model[feature][cls] || 0) + 1;
            this._classes[cls].features = (this._classes[cls].features || 0) + 1;
        }
        this._classes.total = (this._classes.total || 0) + 1;
        this._classes[cls].docs = (this._classes[cls].docs || 0) + 1;
    }

    /**
     * Trains occurrences from background/unclassifiable source
     * @method nlpjs.classifier.NaiveBayes#addBackgroundOccurences
     * @param featureSet
     */
    addBackgroundOccurences(featureSet){
        for (let feature of featureSet) {
            if (!this._model[feature]) {
                this._model[feature] = {};
            }
            this._model[feature].total = (this._model[feature].total || 0) + 1;
        }
        this._classes.total = (this._classes.total || 0) + 1;
    }


    /**
     * @method nlpjs.classifier.NaiveBayes#removeFeature
     * @param feature
     */
    removeFeature(feature){
        if (this._model[feature]) {
            delete(this._model[feature]);
            this._unique_features -= 1;
        }
    }

    /**
     * @method nlpjs.classifier.NaiveBayes#removeUnsignificantFeatures
     * @param threshold absolute difference in significance
     */
    removeUnsignificantFeatures(threshold=0){
        var features = this.significances(Infinity);
        for (var i = features.length-1; i >= 0; i--){
            var feature = features[i];
            if (feature.v <= threshold){
                this.removeFeature(feature.f);
            }
        }
    }

    /**
     * Selects most significant features
     * @method nlpjs.classifier.NaiveBayes#mostSignificant
     * @param {number} n number of features to take
     */
    mostSignificant(n, absolute = true){
        var features = this.significances(n, absolute);
        return features.map(x => x.f);
    }

    /**
     * Compute significance of features
     * @method nlpjs.classifier.NaiveBayes#significances
     * @param n return only n most significant (Default is all)
     */
    significances(n=Infinity, absolute=true){
        var features = [];
        var bound = -Infinity;
        for (var f in this._model){
            if (this._model.hasOwnProperty(f)){
                var value = this.significance(f, absolute);
                if (bound < value || features.length < n){
                    features.push({f: f, v: value});
                    bound = Math.min(value, bound);
                }
            }
        }
        features.sort(function(a,b){
            return b.v - a.v;
        });
        features.splice(n, features.length);
        return features;
    }
    /**
     * Significance is difference of probability
     * of least and most probable classes
     * @method nlpjs.classifier.NaiveBayes#significance
     * @param {*} feature
     * @return {Number} significance
     */
    significance(feature, absolute=true){
        var min = Infinity;
        var max = -Infinity;
        var probabilities = this.probabilities([feature]);
        for (var cls in probabilities){
            if (probabilities.hasOwnProperty(cls)){
                var p = probabilities[cls];
                if (p < min){
                    min = p;
                }
                if (p > max){
                    max = p;
                }
            }
        }
        if (absolute){
            return max - min;
        } else {
            return (max - min) / max;
        }
    }

    toJSON(){
        return JSON.stringify(this.save());
    }

    /**
     * Returns current trained model as json
     * @method nlpjs.classifier.NaiveBayes#save
     * @returns {object} serializable state
     */
    save(){
        return {
            f: this._model,
            c: this._classes,
            u: this._unique_features
        };
    }

    /**
     * Loads state from object generated by save method
     * @method nlpjs.classifier.NaiveBayes.load
     * @param json
     * @return {NaiveBayes}
     */
    static load(json){
        return new NaiveBayes(json.f, json.c, json.u);
    }

}