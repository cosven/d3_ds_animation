import gulp from 'gulp';
import babel from 'gulp-babel';
import concat from 'gulp-concat';


gulp.task('js', () => {
  console.log('task js run');
  return gulp.src('./js/*/**')
  .pipe(babel({
      presets: ['es2015']
  }))
  .pipe(concat('all.js'))
  .pipe(gulp.dest('./assert'));
});

gulp.task('default', ['js'], () => {
  console.log('task default run');
});
