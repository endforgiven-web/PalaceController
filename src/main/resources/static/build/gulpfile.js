/**gulp includes**********************************************/
const gulp = require("gulp"),
  uglify = require("gulp-uglify"),
  concat = require("gulp-concat"),
  zip = require("gulp-zip"),
  replace = require("gulp-replace");
const { dest } = require("vinyl-fs");

/**paths******************************************************/

const headerPath = "../js/header.js";

const minFileName = "palaceController.min.";

const userVars = "../js/userVars.js";

const src = [
  "../js/PalaceController.js",
];

/**tasks******************************************************/

function minifyJSAll() {
  return minifyJS(
    src,
    minFileName + "js"
  );
}

function concatJSAll() {
  return concatFiles(
    [headerPath, userVars, "target/min/" + minFileName + "js"],
    "palaceController.min.user.js"
  );
}

/**build****************************************************/

async function build() {
  minifyJSAll().on("end", function () {
    concatJSAll().on("end", function () {
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
