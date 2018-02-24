//
// Gulp Config
//

/*
 *  Load Plugins
 *  --------------------------------------------------
 */
const gulp = require('gulp')
const del = require('del')
const If = require('gulp-if')
const Browserify = require('browserify')
const Uglify = require('gulp-uglify')
const Handlebars = require('handlebars')
const HandlebarsHelperRepeat = require('handlebars-helper-repeat')
const HandlebarsHelperMoment = require('helper-moment')
const Htmlhint = require('gulp-htmlhint')
const Sass = require('gulp-sass')
const SassLint = require('gulp-sass-lint')
const Autoprefixer = require('gulp-autoprefixer')
const Cssnano = require('gulp-cssnano')
const Sourcemaps = require('gulp-sourcemaps')
const BrowserSync = require('browser-sync')
const VinylBuffer = require('vinyl-buffer')
const VinylSourceStream = require('vinyl-source-stream')
const Metalsmith = require('metalsmith')
// const MetalsmithCollections = require('metalsmith-collections')
const MetalsmithMarkdown = require('metalsmith-markdown')
const MetalsmithLayouts = require('metalsmith-layouts')
const MetalsmithPermalinks = require('metalsmith-permalinks')
const MetalsmithHtmlMinifier = require("metalsmith-html-minifier")

/*
 *  Environment Variables
 *  --------------------------------------------------
 */
let config = {
  isProduction: false,
  version: undefined,
  buildDate: undefined
}

const basePaths = { // Explicit mention current directory and always end a folder name with a slash
  src: './src/',
  dist: './dist/'
}

/*
 *  Handlebars Helper Registry
 *  --------------------------------------------------
 */

/**
 * Repeater (https://github.com/helpers/handlebars-helper-repeat)
 */
Handlebars.registerHelper('repeat', HandlebarsHelperRepeat)

/**
 * Moment (https://github.com/helpers/helper-moment)
 */
Handlebars.registerHelper('moment', HandlebarsHelperMoment)

/**
 * Chain-able helper within if/else for comparing strings
 * 
 * Example usage:
 * {{#if (eq "a" "b")}}
 *   <span>lorem</span>
 * {{else if (eq "c" "d")}}
 *   <span>ipsum</span>
 * {{else}}
 *   <span>fallback</span>
 * {{/if}}
 */
Handlebars.registerHelper('eq', function () {
  const args = Array.prototype.slice.call(arguments, 0, -1)
  return args.every((expression) => {
    return args[0] === expression
  })
})

/*
 *  Modular Tasks
 *  --------------------------------------------------
 */

/**
 * Remove all built files.
 */
gulp.task('clean', (next) => {
  del([
    basePaths.dist
  ]).then((paths) => {
    // console.log('Deleted files and folders:\n', paths.join('\n'));
    next()
  })
})

/**
 * Preparation for Production environment
 */
gulp.task('set-production-mode', (next) => {
  config.isProduction = true
  next()
})

/**
 * Set build variations.
 * - Although these infos don't seems to be useful, it can be injected into app.js to provide better build info.
 */
gulp.task('set-build-config', (next) => {
  const packageJson = require('./package.json')
  config.version = packageJson.version
  config.buildDate = new Date()
  next()
})

/**
 * Copy non process files to distribution locations.
 */
gulp.task('copy:special', (next) => {
  next()
})

gulp.task('copy:fonts', (next) => {
  gulp.src([
      basePaths.src + 'assets/fonts/**/*'
    ])
    .pipe(gulp.dest(basePaths.dist + 'fonts'))
    .on('end', () => {
      next()
    })
})

gulp.task('copy:images', (next) => {
  gulp.src([
      basePaths.src + 'assets/images/**/*'
    ])
    .pipe(gulp.dest(basePaths.dist + 'images'))
    .on('end', () => {
      next()
    })
})

gulp.task('copy', gulp.parallel(
  'copy:special',
  'copy:fonts',
  'copy:images'
))

gulp.task('lint:markups', (next) => {
  gulp.src(basePaths.src + 'templates/**/*.hbs')
    .pipe(Htmlhint('.htmlhintrc'))
    // .pipe(Htmlhint.failOnError())

  next()
})

gulp.task('lint:styles', (next) => {
  gulp.src(basePaths.src + 'stylesheets/**/*.scss')
    .pipe(SassLint())
    .pipe(SassLint.format())
    // .pipe(SassLint.failOnError())

  next()
})

gulp.task('lint:scripts', (next) => {
  // NOTE: Linter is handled as part of TypeScript, this task is just a placeholder
  next()
})

gulp.task('lint', gulp.parallel(
  'lint:markups',
  'lint:styles',
  'lint:scripts'
))

/**
 * Compile sass into a single CSS file.
 */
gulp.task('styles', (next) => {
  gulp.src(basePaths.src + 'stylesheets/*.scss')
    .pipe(If(!config.isProduction, Sourcemaps.init()))
    .pipe(Sass({
      errLogToConsole: true
    }))
    .pipe(Autoprefixer({
      browsers: ['Firefox >= 32', 'Chrome >= 38', 'Explorer >= 10', 'iOS >= 7'],
      cascade: false
    }))
    .pipe(If(config.isProduction, Cssnano()))
    .pipe(If(!config.isProduction, Sourcemaps.write()))
    .pipe(gulp.dest(basePaths.dist + 'css'))
    .pipe(BrowserSync.reload({
      stream: true
    }))

  next()
})

gulp.task('scripts', (next) => {
  Browserify({
      entries: basePaths.src + 'scripts/app.ts',
      debug: !config.isProduction
    })
    .plugin('tsify', {
      sourceMap: !config.isProduction
    })
    .bundle()
    .pipe(VinylSourceStream('app.js'))
    .pipe(VinylBuffer())
    .pipe(If(config.isProduction, Uglify()))
    .pipe(gulp.dest( basePaths.dist + 'js/'))

  next()
})

/*
 *  Generate static HTML files
 *  --------------------------------------------------
 */
gulp.task('markups', (next) => {
  Metalsmith(__dirname)
    .metadata({ // Set global variables inside handlebars
      appVersion: config.version,
      // gtmId: 'GTM-XXXXXX',
      gaId: 'UA-114679826-1'
    })
    .use(MetalsmithMarkdown())
    .use(MetalsmithPermalinks({
      relative: false,
    }))
    .use(MetalsmithLayouts({
      engine: 'handlebars',
      directory: basePaths.src + 'templates/layouts',
      partials: basePaths.src + 'templates/partials',
    }))
    .use(MetalsmithHtmlMinifier())
    .clean(false)
    .source(basePaths.src + 'content')
    .destination(basePaths.dist)
    .build((err) => {
      if (err) {
        console.log('Metalsmith build error:', err)
      }
    })

  next()
})

/**
 * Start a browser-sync server.
 */
gulp.task('server', (next) => {
  BrowserSync.init({
    notify: false,
    server: {
      baseDir: basePaths.dist,
      // index: 'content/index.html', // Set display page of project root.
      // directory: true // Display accessible directory list on browser. Cannot mix with 'index' option.
    },
    files: [
      basePaths.dist + '**/*.html',
      basePaths.dist + '**/*.js'
      // Listen to CSS changes on 'styles' task instead of here.
    ]
  })

  next()
})

/**
 * Start a code watching process to detect changes on fly.
 */
gulp.task('watch:copy', (next)=>  {
  next()
})

gulp.task('watch:markups', (next) => {
  gulp.watch([
    './src/templates/**/*.hbs',
    './src/content/**/*.md'
  ], gulp.series('lint:markups', 'markups'))

  next()
})

gulp.task('watch:styles', (next) => {
  gulp.watch([
    basePaths.src + 'stylesheets/**/*.scss'
  ], gulp.series('lint:styles', 'styles'))

  next()
})

gulp.task('watch:scripts', (next) => {
  gulp.watch([
    basePaths.src + 'scripts/**/*.ts'
  ], gulp.series('lint:scripts', 'scripts'))

  next()
})

gulp.task('watch', gulp.parallel(
  'watch:copy',
  'watch:markups',
  'watch:styles',
  'watch:scripts'
))

/*
 *  Main Task Processors
 *  --------------------------------------------------
 */

/**
 * Build and instantiate browser-sync server for local development purpose.
 */
gulp.task('build', gulp.series(
  gulp.parallel('clean', 'set-build-config', 'lint'),
  gulp.parallel('copy', 'styles', 'scripts', 'markups')
))
gulp.task('build:dev', gulp.series('build')) // Alias

/**
 * Build and generate compressed packages ready for deployment.
 */
gulp.task('build:prod', gulp.series(
  'set-production-mode',
  'build'
))

/**
 * Build and instantiate browser-sync server for local development purpose.
 */
gulp.task('default', gulp.series(
  'build',
  gulp.parallel('server', 'watch')
))
