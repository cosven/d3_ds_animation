import fs from "fs";
import gulp from "gulp";
import rename from "gulp-rename";
import stylus from "gulp-stylus";
import babelify from "babelify";
import concat from "gulp-concat";
import browserify from "browserify";


gulp.task("css", () => {
  gulp.src(["./css/**/*.css",
            "./css/**/*.stylus"])
      .pipe(stylus())
      .pipe(concat('all.css'))
      .pipe(gulp.dest('./assert/'));
});

gulp.task("js", () => {
  console.log("task js run");
  browserify("./js/index.js", {debug: true})
    .transform(babelify, {presets: ["es2015"]})
    .bundle()
    .pipe(fs.createWriteStream("./assert/all.js"));
});

gulp.task("default", ["css", "js"], () => {
  console.log("task default run");
  return gulp.watch(["./js/**/*.js", "./css/**/*.css"], ["js", "css"]);
});
