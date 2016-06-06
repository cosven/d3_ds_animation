import fs from "fs";
import gulp from "gulp";
import rename from "gulp-rename";
import stylus from "gulp-stylus";
import babelify from "babelify";
import concat from "gulp-concat";
import browserify from "browserify";


gulp.task("css", () => {
  console.log("task css run");
  gulp.src(["./css/**/*.css",
            "./css/**/*.styl",
            "./node_modules/jquery-ui/themes/ui-darkness/jquery-ui.css"])
      .pipe(stylus())
      .pipe(concat('all.css'))
      .pipe(gulp.dest('./assert/'));
});

gulp.task("img", () => {
  console.log("task img run");
  gulp.src(['./node_modules/jquery-ui/themes/ui-darkness/images/*.*',],
           {base: './node_modules/jquery-ui/themes/ui-darkness/'})
    .pipe(gulp.dest('./assert/'));

});

gulp.task("js", () => {
  console.log("task js run");
  browserify("./js/index.js", {debug: true})
    .transform(babelify, {presets: ["es2015"]})
    .bundle()
    .pipe(fs.createWriteStream("./assert/all.js"));
});

gulp.task("default", ["css", "js", "img"], () => {
  console.log("task default run");
  return gulp.watch(["./js/**/*.js",
                    "./css/**/*.css",
                    "./css/**/*.styl"], ["js", "css"]);
});
