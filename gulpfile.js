"use strict";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const fs = require('fs');

/*Load plugins*/
const autoprefixer = require("gulp-autoprefixer");
const group_media = require("gulp-group-css-media-queries");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const panini = require("panini");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify");
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const babel = require('gulp-babel');
const webp = require('gulp-webp');
const webphtml = require('gulp-webp-html');
const webpcss = require('gulp-webp-css');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fonter = require('gulp-fonter');
const browserSync = require("browser-sync").create();

/* Paths */
const srcPath = '#src/';
const distPath = 'dist/';

const path = {
	build: {
		html: distPath,
		js: distPath + "assets/js/",
		css: distPath + "assets/css/",
		images: distPath + "assets/images/",
		fonts: distPath + "assets/fonts/",
		svg: distPath + "assets/images/icons",
	},
	src: {
		html: srcPath + "*.html",
		js: srcPath + "assets/js/*.js",
		css: srcPath + "assets/scss/*.scss",
		images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
		fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}",
		svg: srcPath + "assets/images/icons/*.{svg}"
	},
	watch: {
		html: srcPath + "**/*.html",
		js: srcPath + "assets/js/**/*.js",
		css: srcPath + "assets/scss/**/*.scss",
		images: srcPath + "assets/images/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
		fonts: srcPath + "assets/fonts/**/*.{eot,woff,woff2,ttf,svg}"
	},
	clean: "./" + distPath
}


/* Tasks */
function serve() {
	browserSync.init({
		server: {
			baseDir: "./" + distPath
		},
		open: false,
		notify: false
	});
}

function html(cb) {
	panini.refresh();
	return src(path.src.html, { base: srcPath })
		.pipe(plumber())
		.pipe(panini({
			root: srcPath,
			layouts: srcPath + 'layouts/',
			partials: srcPath + 'partials/',
			helpers: srcPath + 'helpers/',
			data: srcPath + 'data/'
		}))
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browserSync.reload({ stream: true }));

	cb();
}

function css(cb) {
	return src(path.src.css, { base: srcPath + "assets/scss/" })
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "SCSS Error",
					message: "Error: <%= error.message %>"
				})(err);
				this.emit('end');
			}
		}))
		.pipe(sass({
			includePaths: './node_modules/'
		}))
		.pipe(group_media())
		.pipe(autoprefixer({
			cascade: true
		}))
		.pipe(cssbeautify())
		//.pipe(webpcss(['.jpg', '.jpeg', '.png']))
		.pipe(dest(path.build.css))
		.pipe(cssnano({
			zindex: false,
			discardComments: {
				removeAll: true
			}
		}))
		.pipe(removeComments())
		.pipe(rename({
			suffix: ".min",
			extname: ".css"
		}))
		.pipe(dest(path.build.css))
		.pipe(browserSync.reload({ stream: true }));

	cb();
}

function cssWatch(cb) {
	return src(path.src.css, { base: srcPath + "assets/scss/" })
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "SCSS Error",
					message: "Error: <%= error.message %>"
				})(err);
				this.emit('end');
			}
		}))
		.pipe(sass({
			includePaths: './node_modules/'
		}))
		.pipe(rename({
			suffix: ".min",
			extname: ".css"
		}))
		.pipe(dest(path.build.css))
		.pipe(browserSync.reload({ stream: true }));

	cb();
}

function js(cb) {
	return src(path.src.js, { base: srcPath + 'assets/js/' })
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "JS Error",
					message: "Error: <%= error.message %>"
				})(err);
				this.emit('end');
			}
		}))
		.pipe(webpackStream({
			mode: "production",
			output: {
				filename: 'app.js',
			},
			module: {
				rules: [
					{
						test: /\.(js)$/,
						exclude: /(node_modules)/,
						// loader: 'babel-loader',
						// query: {
						// 	presets: ['@babel/preset-env']
						// }
					}
				]
			}
		}))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(rename({
			suffix: ".min",
			extname: ".js"
		}))
		.pipe(dest(path.build.js))
		.pipe(browserSync.reload({ stream: true }));

	cb();
}

function jsWatch(cb) {
	return src(path.src.js, { base: srcPath + 'assets/js/' })
		.pipe(plumber({
			errorHandler: function (err) {
				notify.onError({
					title: "JS Error",
					message: "Error: <%= error.message %>"
				})(err);
				this.emit('end');
			}
		}))
		.pipe(webpackStream({
			mode: "development",
			output: {
				filename: 'app.js',
			}
		}))
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(rename({
			suffix: ".min",
			extname: ".js"
		}))
		.pipe(dest(path.build.js))
		.pipe(browserSync.reload({ stream: true }));

	cb();
}

function images(cb) {
	return src(path.src.images)
		.pipe(webp({
			quality: 70
		}))
		.pipe(dest(path.build.images))
		.pipe(src(path.src.images))
		// .pipe(imagemin([
		// 	imagemin.gifsicle({ interlaced: true }),
		// 	imagemin.mozjpeg({ quality: 95, progressive: true }),
		// 	imagemin.optipng({ optimizationLevel: 5 }),
		// 	imagemin.svgo({
		// 		plugins: [
		// 			{ removeViewBox: true },
		// 			{ cleanupIDs: false }
		// 		]
		// 	})
		// ]))
		.pipe(dest(path.build.images))
		.pipe(browserSync.reload({ stream: true }));

	cb();
}

// function svg_sprite() {
// 	return gulp.src(path.src.svg)
// 		.pipe(svgSprite({
// 			shape: {
// 				dimension: {         // Set maximum dimensions
// 					maxWidth: 500,
// 					maxHeight: 500
// 				},
// 				spacing: {         // Add padding
// 					padding: 0
// 				}
// 			},
// 			mode: {
// 				symbol: {
// 					dest: '.'
// 				}
// 			}}))
// 		.pipe(dest(path.build.svg));
// };

function fonts(cb) {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts))

	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
		.pipe(browserSync.reload({ stream: true }));

	cb();
};

gulp.task('otf2ttf', function () {
	return src([srcPath + 'assets/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(gulp.dest(srcPath + 'assets/fonts/'));
});

gulp.task('cssSwiper', function () {
	return src(['node_modules/swiper/swiper-bundle.min.css'])
		.pipe(gulp.dest(srcPath + path.build.css));
});

function fontsStyle(params) {
	let file_content = fs.readFileSync(srcPath + 'assets/scss/service/fonts.scss');
	if (file_content == '') {
		fs.writeFile(srcPath + 'assets/scss/service/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(srcPath + 'assets/scss/service/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
};

function cb() {

};

function clean(cb) {
	return del(path.clean);

	cb();
};

function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], cssWatch);
	gulp.watch([path.watch.js], jsWatch);
	gulp.watch([path.watch.images], images);
	gulp.watch([path.watch.fonts], fonts);
};

const build = gulp.series(clean, gulp.parallel(html, css, js, images, fonts), fontsStyle);
const watch = gulp.parallel(build, watchFiles, serve);

/* Exports Tasks */

// exports.html = html;
// exports.css = css;
// exports.js = js;
// exports.images = images;
// exports.fonts = fonts;
// exports.fontsStyle = fontsStyle;
//exports.svg_sprite = svg_sprite;

exports.clean = clean;
exports.build = build;
exports.watch = watch;
exports.default = watch;
