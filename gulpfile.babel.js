import fs from "fs";
import gulp from "gulp";
import rename from "gulp-rename";
import babelify from "babelify";
import concat from "gulp-concat";
import browserify from "browserify";


gulp.task("js", () => {
  console.log("task js run");
  browserify("./js/index.js", {debug: true})
    .transform(babelify, {presets: ["es2015"]})
    .bundle()
    .pipe(fs.createWriteStream("./assert/all.js"));
});

gulp.task("default", ["js"], () => {
  console.log("task default run");
  return gulp.watch(["./js/**/*.js", "./css/**/*.css"], ["js"]);
});
