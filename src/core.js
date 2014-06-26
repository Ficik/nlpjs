define('nlpjs/core', [
  'nlpjs/core/AnnotationSet',
  'nlpjs/core/Container',
  'nlpjs/core/Corpus',
  'nlpjs/core/Document',
  'nlpjs/core/HtmlDocument'
], function(AnnotationSet, Container, Corpus, Document, HtmlDocument){
  return {
    AnnotationSet : AnnotationSet,
    Container     : Container,
    Corpus        : Corpus,
    Document      : Document,
    HtmlDocument  : HtmlDocument
  };
});
