var gulp = require('gulp-help')(require('gulp')),
    yargs = require('yargs'),
    jshintStylish = require('jshint-stylish'),
    AMDFormatter = require('es6-module-transpiler-amd-formatter');
var $gulp = require('gulp-load-plugins')();
$gulp.del = require('del');


gulp.task('js', 'process javascript files and put them to dist dir', function(){
    return gulp.src('src/**/*.js')
              .pipe($gulp.plumber())
              .pipe($gulp.sourcemaps.init())
              .pipe($gulp.jshint())
              .pipe($gulp.jshint.reporter(jshintStylish))
              .pipe($gulp.babel({
                filenameRelative: 'sourceRoot',
                sourceRoot: 'src',
                moduleRoot: 'nlpjs',
                modules: 'amdStrict'
              }))
              //.pipe($gulp.uglify())
              .pipe($gulp.sourcemaps.write(''))
              .pipe(gulp.dest('dist'));
              /*.pipe($gulp.es6ModuleTranspiler({
                  basePath: 'src',
                  importPaths: ['nlpjs'],
                  formatter: new AMDFormatter()
              }))
              .pipe(gulp.dest('.'))*/
});

gulp.task('test', 'runs tests using mocha and blanket', [], function(){
  var stream = $gulp.mochaPhantomjs({reporter: 'nyan'});
  stream.write({path: 'http://localhost:8000/test/index.html'});
  stream.end();
  return stream;
});

gulp.task('docs', 'generates documentation into doc dir', ['clean'], function(){
    return gulp.src('src/**/*.js')
               .pipe($gulp.plumber())
               .pipe($gulp.babel())
               .pipe($gulp.jsdoc('docs', {
                    path: 'ink-docstrap',
                    inverseNav: true,
                    theme: "superhero"},
                {
                    name: 'NLP.js'
                }));
});

gulp.task('clean', 'removes build files', function(cb){
    return $gulp.del(['dist/**', 'docs/**'], cb);
});

gulp.task('demo', 'build demo code', function(){
   return gulp.src('demo/live.js')
        .pipe($gulp.browserify({
           transform: ['babelify']
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('build', 'one time build of documentationa and javascript', ['clean', 'js', 'docs']);

gulp.task('default', 'task for starting development with file watching', ['webserver', 'build'], function(){
    gulp.watch(['src/**/*.js'], ['build']);
});

gulp.task('webserver', function() {
  gulp.src('.')
    .pipe($gulp.webserver({
      livereload: true,
      directoryListing: true,
      open: true,
      fallback: 'index.html'
    }));
});
