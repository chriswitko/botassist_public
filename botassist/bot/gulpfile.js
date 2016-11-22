// installing gulp@4 https://www.liquidlight.co.uk/blog/article/how-do-i-update-to-gulp-4/

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var proxy = require('http-proxy-middleware');

function reload(done) {
  browserSync.reload();
  done();
}

gulp.task('copy', function() {
  return gulp.src(['src/**/*', '!src/scss/'])
  .pipe(gulp.dest('build/'))  
});

gulp.task('copy:test', function() {
  return gulp.src(['test/**/*.html'])
  .pipe(gulp.dest('build/test/'))  
});

gulp.task('sass', function () {
  return gulp.src('src/scss/**/*.scss')
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('build/assets/css'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.css', gulp.series(['copy']), reload);
  gulp.watch('src/**/*.json', gulp.series(['copy']), reload);
  gulp.watch('src/**/*.html', gulp.series(['copy']), reload);
  gulp.watch('src/**/*.js', gulp.series(['copy']), reload);
  gulp.watch('src/scss/**/*.scss', gulp.series(['sass']), reload);
  gulp.watch('test/**/*.html', gulp.series(['copy:test']), reload);
});

gulp.task('serve', function(cb) {

  var proxyServer = proxy('/api', {
    target: 'http://localhost:3000'
  });

  browserSync.instance = browserSync.init({
    startPath: '/test/',
    server: {
      baseDir: ['build'],
      middleware: [proxyServer]
    }
  }, cb);
});

gulp.task('default', gulp.series(['sass', 'copy', 'copy:test', 'serve', 'watch']));
