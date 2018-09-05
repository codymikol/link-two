let gulp = require('gulp');
let babel = require('gulp-babel');
let uglify = require('gulp-uglify');
let zip = require('gulp-zip');
let del = require('del');

gulp.task('clean', () => del('dist'));

function codySmash(filename) {
    return gulp.src('public/' + filename)
        .pipe(gulp.dest('public/dist/uncompressed'))
        .pipe(babel({presets: ['@babel/env']}))
        .pipe(uglify())
        .pipe(gulp.dest('public/dist/compressed'));
}

gulp.task('smash-client', () => codySmash('client.js'));
gulp.task('smash-shared', () => codySmash('shared.js'));
gulp.task('smash-server', () => codySmash('server.js'));

gulp.task('smash', gulp.parallel('smash-client', 'smash-shared', 'smash-server'));

gulp.task('zip', () => {
    return gulp.src('public/dist/compressed/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('public/dist'));
});

gulp.task('default', gulp.series('clean', 'smash', 'zip'));

