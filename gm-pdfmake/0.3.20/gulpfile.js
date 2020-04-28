var gulp = require('gulp');
var webpack = require('webpack-stream');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var replace = require('gulp-replace');
var mocha = require('gulp-spawn-mocha');
var jshint = require('gulp-jshint');
var each = require('gulp-each');
var fc2json = require('gulp-file-contents-to-json');
var header = require('gulp-header');
var umd = require('gulp-umd');
var DEBUG = process.env.NODE_ENV === 'debug',
	CI = process.env.CI === 'true';

var banner = '/*! <%= pkg.name %> v<%= pkg.version %>, @license <%= pkg.license %>, @link <%= pkg.homepage %> */\n';

var uglifyOptions = {
	compress: {
		drop_console: true
	},
	mangle: {
		except: ['HeadTable', 'NameTable', 'CmapTable', 'HheaTable', 'MaxpTable', 'HmtxTable', 'PostTable', 'OS2Table', 'LocaTable', 'GlyfTable']
	}
};


gulp.task('default', [/*'lint',*/ 'test', 'build', 'buildFonts']);
gulp.task('build', function () {
	var pkg = require('./package.json');
	return gulp.src('src/browser-extensions/pdfMake.js')
		.pipe(webpack(require('./webpack.config.js'), null, reportWebPackErrors))
		.pipe(replace(/\/[*/][@#]\s+sourceMappingURL=((?:(?!\s+\*\/).)*).*\n/g, ''))
		.pipe(header(banner, { pkg: pkg }))
		.pipe(gulp.dest('build'))
		.pipe(sourcemaps.init())
		.pipe(uglify(uglifyOptions))
		.pipe(header(banner, { pkg: pkg }))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('build'));
});

function reportWebPackErrors(err, stats) {
	if (err) {
		throw new gutil.PluginError("webpack", err);
	}
	gutil.log("[webpack]", stats.toString({
	}));
}

gulp.task('test', ['prepareTestEnv'], function (cb) {
	return gulp.src(['test-env/tests/**/*.js'])
		.pipe(mocha({
			debugBrk: DEBUG,
			R: CI ? 'spec' : 'nyan'
		}));
});

gulp.task('prepareTestEnv', ['copy-src-with-exposed-test-methods', 'copy-tests']);

gulp.task('copy-src-with-exposed-test-methods', function () {
	return gulp.src(['src/**/*.js'], { base: './' })
		.pipe(replace(/^(\/(\*)*TESTS.*$)/gm, '/$1'))
		.pipe(gulp.dest('test-env'));
});

gulp.task('copy-tests', function () {
	return gulp.src('tests/**/*.*', { base: './' })
		.pipe(gulp.dest('test-env'));
});

gulp.task('lint', function () {
	return gulp.src(['./src/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter());
});

gulp.task('buildFonts', function () {
	return gulp.src(['./examples/fonts/*.*'])
		.pipe(each(function (content, file, callback) {
			var newContent = new Buffer(content).toString('base64');
			callback(null, newContent);
		}, 'buffer'))
		.pipe(fc2json('vfs_fonts.js'))
		.pipe(each(function (content, file, callback) {
			var newContent = 'this.pdfMake = this.pdfMake || {}; this.pdfMake.vfs = ' + content + ';';
			// var newContent = 'export default ' + content;
			callback(null, newContent);
		}, 'buffer'))
		.pipe(gulp.dest('build'));
});

const splitFiles = require("gulp-split-files");

gulp.task('splitFonts', function () {
	return gulp.src(['./examples/fonts/*.*'])
		.pipe(each(function (content, file, callback) {
			var newContent = new Buffer(content).toString('base64');
			var filename = file.relative.replace('.ttf', '').replace('-', '_');
			var mid = Math.floor(newContent.length / 2);
			newContent = `/*splitfilename=${filename}_0.js*/` + newContent.slice(0, mid) + `/*split*//*splitfilename=${filename}_1.js*/` + newContent.slice(mid);
			callback(null, newContent);
		}, 'buffer'))
		.pipe(splitFiles())
		.pipe(each(function (content, file, callback) {
			var filename = file.relative.replace('.js', '');
			var newContent = `var ${filename} = "${content}";`;
			callback(null, newContent);
		}, 'buffer'))
		.pipe(umd({
      exports: function(file) {
          return file.relative.replace('.js', '');
        },
        namespace: function(file) {
          return file.relative.replace('.js', '');
        }
    }))
		.pipe(rename({ extname: '.js'}))
		.pipe(gulp.dest('build/splits'));
});
