System.import('nlpjs/core/Annotation')
  .then(function(AnnotationModule){
    var Annotation = AnnotationModule.default;

    describe('Annotation', function () {

      it('should initialize', function () {
        var ann = new Annotation();
      });
    });
  });
