
var gulp        = require('gulp'),
    sass        = require('gulp-sass'),
    browserSync = require('browser-sync'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglifyjs'),
    cssnano     = require('gulp-cssnano'),
    rename      = require('gulp-rename');
    del         = require('del'),
    imagemin    = require('gulp-imagemin'),
    pngquant    = require('imagemin-pngquant'),
    cache       = require('gulp-cache'),
    prefix      = require('gulp-autoprefixer'),
    spritesmith = require('gulp.spritesmith'),
    sourcemaps  = require('gulp-sourcemaps'),
    coffee      = require('gulp-coffee'),
    jshint      = require('gulp-jshint'),
    babel       = require('gulp-babel'),
    notify      = require('gulp-notify'),
    wiredep     = require('wiredep').stream,
    useref      = require('gulp-useref'),
    gulpif      = require('gulp-if'),
    // uglify2     = require('gulp-uglify'),
    minifyCss   = require('gulp-clean-css');



gulp.task('html', function () {
    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('dist'));
});

gulp.task('bower', function () {
  gulp.src('src/index.html')
    .pipe(wiredep({
      directory : "src/bower"
    }))
    .pipe(gulp.dest('src'));
});


gulp.task('sass', function(){
  return gulp.src(['src/sass/**/*.+(scss|sass)'])
  .pipe(sourcemaps.init())
  .pipe( sass().on( 'error', notify.onError(
     {
       message: "<%= error.message %>",
       title  : "ЧТООО???"
   } ) ) )
  .pipe(sass({outputStyle: 'expanded'}))
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest('src/css'))
  // .pipe(notify({ message: 'This is хорошо!' }))
  .pipe(browserSync.reload({stream: true}));
});

gulp.task('css-min',['sass'], function(){
  return gulp.src(['src/css/style.css']) //'src/css/libs.css',
    .pipe(cssnano({zindex: false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('src/css'));
});


//old libs-JS
// gulp.task('script-libs',function(){
//   return gulp.src([
//     'src/libs/jquery/dist/jquery.js',
//     'src/libs/swiper/dist/js/swiper.js',
//     'src/libs/foundation-sites/dist/js/foundation.js',
//     'src/libs/jquery.maskedinput/dist/jquery.maskedinput.js',
//   ])
//   .pipe(concat('libs.min.js'))
//   .pipe(uglify())
//   .pipe(gulp.dest('src/js'));
// });
//old libs-JS


// ['coffee'] close
gulp.task('script',function(){
  return gulp.src('src/scripts/common/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./maps'))
    .pipe(concat('common.min.js'))
    .pipe(gulp.dest('src/scripts'))
    .pipe(browserSync.reload({stream: true}));
});

// coffee close
// gulp.task('coffee', function() {
//   gulp.src('src/js/coffee/**/*.coffee')
//     .pipe(sourcemaps.init())
//     .pipe(coffee({bare: true}))
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest('src/js/common'))
//     .pipe(browserSync.reload({stream: true}));
// });
// coffee close

gulp.task('browser-sync', function(){
  browserSync({
    server: {
      baseDir: 'src'
    },
    notify: false,
    host: 'localhost',
    port: 3000,
    logPrefix: "Frontend_Devil"
  });
});

gulp.task('img',['sprite'],function(){
  return gulp.src('src/img/**/*')
  .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgPlugins: [{removeViewBox: false}],
      une: [pngquant()]
    })))
  .pipe(gulp.dest('src/img'))
});

gulp.task('sprite', function() {
    var spriteData =
        gulp.src('src/img/sprite/*.png')
            .pipe(spritesmith({
                imgName: 'sprite.png',
                cssName: '_sprite.sass',
                cssFormat: 'sass',
                algorithm: 'binary-tree', // форма спрайта
                imgPath: '../img/sprite.png',
            }));

    spriteData.img.pipe(gulp.dest('src/img'));
    spriteData.css.pipe(gulp.dest('src/sass/basic'));
});

gulp.task('clear',function(){
  return cache.clearAll();
});

gulp.task('clean',function(){
  return del.sync('dist');
});


// 'script-libs' old
gulp.task('start', ['browser-sync', 'sprite', 'clean', 'img', 'css-min', 'bower', 'html', 'script','build'], function(){
  gulp.watch('src/sass/**/*.+(scss|sass)',['sass']);
  gulp.watch('src/css/**/*.css'); // убрал ['sass'] как сверху!!!

  // gulp.watch('src/js/coffee/*.coffee',['coffee']);  // coffee close
  gulp.watch('src/scripts/common/*.js',['script']);

  gulp.watch('bower.json',['bower']);

  gulp.watch('src/*.html',browserSync.reload);
  gulp.watch('src/scripts/**/*.js',browserSync.reload);
});
// 'coffee','script-libs'
gulp.task('build',['clean','css-min','script','html'], function(){
  var buildCss = gulp.src(['src/css/style.min.css','src/css/libs.min.css'])
  .pipe(gulp.dest('dist/css'));
  var buildFonts = gulp.src(['src/fonts/**/*'])
  .pipe(gulp.dest('dist/fonts'));
  var buildJavaScript = gulp.src(['src/scripts/**/*.js'])
  .pipe(gulp.dest('dist/scripts'));
  var buildImages = gulp.src(['src/img/**/*'])
  .pipe(gulp.dest('dist/img'));
  // var buildHtml = gulp.src('src/*html')
  // .pipe(gulp.dest('dist'));
});
