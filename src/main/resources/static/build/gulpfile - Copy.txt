/**gulp includes**********************************************/
const gulp = require("gulp"),
  uglify = require("gulp-uglify"),
  ts = require('gulp-typescript'),
  concat = require("gulp-concat"),
  zip = require("gulp-zip"),
  replace = require("gulp-replace");
const { dest } = require("vinyl-fs");

/**paths******************************************************/
const userVars = "../js/userVars.js";

const bIheaderPath = "../js/BardInterfaceTools/header.js";
const minBIFileName = "bardInterfaceTools";
const bIToolsSRC = [
  "../js/BardInterfaceTools/*.{js,ts}",
  "../js/util/*.{js,ts}",
];

const gCheaderPath = "../js/GoogleChatTools/header.js";
const minGCFileName = "googleChatTools";
const gCToolsSRC = [
  "../js/GoogleChatTools/*.{js,ts}",
  "../js/util/*.{js,ts}",
];

const tsBIProject = ts.createProject('../js/BardInterfaceTools/tsconfig.json');
const tsGCProject = ts.createProject('../js/GoogleChatTools/tsconfig.json');

/**tasks******************************************************/

function minifyJSAll() {

  minifyJS(
    gCToolsSRC,
    minGCFileName + ".min.js"
  );

  return minifyJS(
    bIToolsSRC,
    minBIFileName + ".min.js"
  );
}

function concatJSAll() {

  concatFiles(
    [gCheaderPath, userVars, "target/min/" + minGCFileName + "js"],
    tsGCProject,
    minGCFileName + ".user.js"
  );

  return concatFiles(
    [bIheaderPath, userVars, "target/min/" + minBIFileName + "js"],
    tsBIProject,
    minBIFileName + ".user.js"
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

  watchJS(
    minGCFileName + ".all.min.dev.js",
    tsGCProject,
    [gCheaderPath, userVars],
    gCToolsSRC,
  );

  return watchJS(
    minBIFileName + ".all.min.dev.js",
    tsBIProject,
    [bIheaderPath, userVars],
    bIToolsSRC,
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

function concatThen(src, path, destination, func, tsProject, ...funcArgs) {
  return gulp
    .src(src)
    .pipe(tsProject())
    .pipe(concat({ path: path }))
    .pipe(func(...funcArgs))
    .pipe(replace("\n", ""))
    .pipe(dest(destination, { base: "dest" }));
}

function concatFiles(src, concatPath, tsProject) {
  return (
    gulp
      .src(src)
      .pipe(tsProject())
      // .pipe(debug())
      .pipe(concat({ path: concatPath }))
      .pipe(dest("target/min"))
  );
}

function watchJS(concatPath, tsProject, ...concatSRC) {
  if (concatSRC.length) {
    let src = concatSRC[0];
    for (let i = 1; i < concatSRC.length; i++) src = src.concat(concatSRC[i]);
    return gulp.watch(src, function (done) {
      concatFiles(src, concatPath, tsProject);
      done();
    });
  }
  return gulp;
}
