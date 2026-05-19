/**gulp includes**********************************************/
const gulp = require("gulp"),
  uglify = require("gulp-uglify"),
  concat = require("gulp-concat");
// strip = require("gulp-strip-comments"),
//  zip = require("gulp-zip"),
// rename = require("gulp-rename"),
//  debug = require("gulp-debug"),
// order = require("gulp-order"),
// cleanCSS = require("gulp-clean-css"),
// footer = require("gulp-footer"),
// removeEmptyLines = require("gulp-remove-empty-lines"),
//replace = require("gulp-replace");
const { dest } = require("vinyl-fs");

/**paths******************************************************/

const headerPath = "../static/js/header.js";

const minFileName = "palaceController.min.";

const userVars = "../static/js/userVars.js";




//"./static/js/jsPlus/*/*.js",
//"./static/js/jsPlus/**/*.js"
//"../static/js/shillaPlus/**/*.js",
//"../static/js/shillaIdle/*/generic/*.js",
// "../static/js/shillaIdle/*/**/*.js",

const src = [
  "../static/js/PalaceController.js",
];

/**tasks******************************************************/

function minifyJSAll() {
  return minifyJS(
    idleSrc,
    minFileName + "js"
  );
}

function concatJSAll() {
  concatFiles(
    [headerPath, userVars, "target/min/" + minFileName + "js"],
    "palaceController.min.user.js"
  );
}

function zipAll() {
  return gulp
    .src(["target/min/*.user.js", "../README.MD"])
    .pipe(zip("palaceController.zip"))
    .pipe(dest("target"));
}

/**build****************************************************/

async function build() {
  minifyJSAll().on("end", function () {
    concatJSAll().on("end", function () {
      zipAll();
    });
  });
}

exports.build = build;

/**watch****************************************************/
async function watchDev() {
  return watchJS(
    "palaceController.all.min.dev.js",
    [headerPath, userVars],
    src,
  );
}

exports.watchDev = watchDev;

/**helpers****************************************************/
function minifyJS(src, path) {
  return concatThen(src, path, "target/min", uglify, {
    mangle: { toplevel: true },
  });
}

function minifyCSS(src, path) {
  return concatThen(src, path, "target/min", cleanCSS);
}

function concatThen(src, path, destination, func, ...funcArgs) {
  return gulp
    .src(src)
    .pipe(concat({ path: path }))
    .pipe(func(...funcArgs))
    .pipe(replace("\n", ""))
    .pipe(dest(destination, { base: "dest" }));
}

function concatFiles(src, concatPath) {
  return (
    gulp
      .src(src)
      // .pipe(debug())
      .pipe(concat({ path: concatPath }))
      .pipe(footer("\n"))
      .pipe(dest("target/min"))
  );
}

function watchJS(concatPath, ...concatSRC) {
  if (concatSRC.length) {
    let src = concatSRC[0];
    for (let i = 1; i < concatSRC.length; i++) src = src.concat(concatSRC[i]);
    return gulp.watch(src, function (done) {
      concatFiles(src, concatPath);
      done();
    });
  }
  return gulp;
}
