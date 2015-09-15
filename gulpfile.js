//
// Require
//
var fs = require('fs'),
    pkg = require('./package.json'),
    path = require('path'),
    gulp = require('gulp'),
    swig = require('gulp-swig'),
    svgmin = require('gulp-svgmin'),
    rename = require('gulp-rename'),
    frontMatter = require('gulp-front-matter');


//
// Options
//
var options = {
    readme: {
        template: './tmpl/markdown/README.tmpl',
        filename: 'README.md',
        destination: '.',
    },
    index: {
        template: './tmpl/html/index.tmpl',
        filename: 'index.html',
        destination: './dist'
    },
    src: './src/',
    dist: './dist/'
};


//
// Custom Functions
//
function getFolders(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isDirectory();
		});
}
function getIcons(dir) {
	return fs.readdirSync(dir)
		.filter(function(file) {
			return fs.statSync(path.join(dir, file)).isFile();
		});
}


//
// Minify SVGs
//
gulp.task('svgmin', function(cb) {
    gulp.src([
            options.src + '**/*.svg'
        ])
        .pipe(svgmin())
        .pipe(gulp.dest(options.dist));
    cb();
});


//
// Compile Readme
//
gulp.task('compile-docs', function(cb) {
	var data = [];
	var folders = getFolders(options.dist);
	for (var i=0; i<folders.length; i++) {
		var folder = folders[i];
        icons = getIcons(options.dist + folder);
		data.push({
			folder: folder,
			title: folder.charAt(0).toUpperCase() + folder.slice(1),
            count: icons.length,
			icons: icons
		});
	}
	var opts = {
		data: {
            pkg: pkg,
			folders: data
		}
	};
    gulp.src(options.readme.template)
		.pipe(frontMatter({ property: 'data' }))
		.pipe(swig(opts))
		.pipe(rename(options.readme.filename))
		.pipe(gulp.dest(options.readme.destination));
    gulp.src(options.index.template)
		.pipe(frontMatter({ property: 'data' }))
		.pipe(swig(opts))
		.pipe(rename(options.index.filename))
		.pipe(gulp.dest(options.index.destination));
    cb();
});


//
// Default Task
//
gulp.task('default', [
    'svgmin',
    'compile-docs'
]);