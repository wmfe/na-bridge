const gulp = require('gulp');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');


gulp.task('lint', () => {
    return gulp.src(['src/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('default', ['lint'], function () {
    return gulp.src('src/*.js')
        .pipe(babel({
            // presets: ['es2015']
        }))
        .pipe(gulp.dest('lib'))
});

gulp.task('watch', function () {
    gulp.watch(['src/*.js'], ['default']);
});
