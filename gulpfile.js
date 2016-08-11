/// <reference path="typings/index.d.ts" />
'use strict'
const child_process = require('child_process');
const spawn = child_process.spawn;
const gulp = require('gulp');
const plumber = require('gulp-plumber');
const nodemon = require('gulp-nodemon');
const gulpts = require('gulp-typescript');
const prettydiff = require('gulp-prettydiff');
const browserSync = require('browser-sync');
const path = require('path');

const serverProject = gulpts.createProject('tsconfig.json', {
    typescript: require('typescript'),
    module: "commonjs"
});

const tsProject = gulpts.createProject('tsconfig.json', {
    typescript: require('typescript'),
    module: "es2015"
});

gulp.task('serverCompile', () => {
    gulp.src('src/server/**/*.ts')
        .pipe(plumber())
        .pipe(gulpts(serverProject))
        .js
        .pipe(prettydiff({
            lang: 'js',
            mode: 'minify'
        }))
        .pipe(gulp.dest('build/server'));
});

gulp.task('tsCompile', () => {
    gulp.src('src/client/**/*.ts')
        .pipe(plumber())
        .pipe(gulpts(tsProject))
        .js
        .pipe(prettydiff({
            lang: 'js',
            mode: 'minify'
        }))
        .pipe(gulp.dest('build/client'));
});

gulp.task('start', ['tsCompile', 'serverCompile', 'browser-sync','nodemon'], () => {
    gulp.watch('src/server/**/*.ts', ['serverCompile']);
    gulp.watch('src/client/**/*.ts', ['tsCompile']);
});

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init({
        proxy: "localhost:8888",
        port: 3000,
        serveStatic: ['build/static'],
        open:false
    })
});

gulp.task('nodemon', () => {
    nodemon({
        script: 'build/server/index.js',
        watch: 'build/server/**/*.*',
        ignore: ['build/client/**/*']
    }).on('start', () => { }).on('restart', () => {
        setTimeout(function () {
            browserSync.reload();
        }, 500);
    });
});

gulp.task('default', ['start'], () => {

});