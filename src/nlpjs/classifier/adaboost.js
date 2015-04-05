
/**
 * Implementation of Discrete AdaBoost algorithm
 * @class nlpjs.classifier.AdaBoost
 */
export default class AdaBoost {

    /**
     * @constructor
     * @param classes
     * @properties {object} _classes
     * @properties {Array} _classifiers
     * @properties {Array<Number>} _weights
     */
    constructor(classes){
        this._classifiers = [];
        this._weights = [];
    }

    /**
     * Add weak classifier
     * @param {function} classifier
     * @param {number} weight classifier contribution to classification
     * @param {string} label name of classifier
     */
    addWeakClassifier(classifier, weight = 0, label='unknown'){
        this._classifiers.push(classifier);
        this._weights.push(weight);
    }

    /**
     *
     */
    train(classA, classB){
        var x = classA.concat(classB);
        var trainingSet = [];
        for (var i=0, ii=x.length; i < ii; i++){
            trainingSet.push([x[i], i < classA.length ? 1 : -1, i]);
        }
        var n = x.length;
        var D = x.map(() => 1/n);

        var error = (fn, x, y) => Math.exp(-y * fn(x));

        for (var it = 0, itt = this._classifiers.length; it < itt; it++) {

            // calcaulate error of best classifier
            var minError = Infinity;
            var selectedClassifier = null;
            var selectedClassifierIndex = -1;
            for (var t = 0, tt = this._classifiers.length; t < tt; t++) {
                let classifier = this._classifiers[t];
                var WSError = trainingSet.reduce((sum, sample) => sum + D[sample[2]] * error(classifier, sample[0], sample[1]), 0);
                console.log(WSError);
                if (WSError < minError) {
                    minError = WSError;
                    selectedClassifier = classifier;
                    selectedClassifierIndex = t;
                }
            }

            var alpha = 0.5 * Math.log((1 - minError) / minError);
            this._weights[selectedClassifierIndex] += alpha;

            // alter train set weights
            var DTotal = 0;
            for (let di = 0, dii = D.length; di < dii; di++) {
                D[di] = D[di] * Math.exp(-trainingSet[di][1] * alpha * selectedClassifier(trainingSet[di][0]));
                DTotal += D[di];
            }
            // normalizing weights
            for (let di = 0, dii = D.length; di < dii; di++) {
                D[di]/=DTotal;
            }
            console.log(D.join(':') + '\n' , alpha, selectedClassifier.toString());
        }
    }

    /**
     * Perform classification
     * @param feature
     */
    classify(feature){
        var score = 0;
        for (var i = 0, ii = this._classifiers.length; i < ii; i++){
            score += this._classifiers[i](feature) * this._weights[i];
        }
        return Math.sign(score);
    }

}