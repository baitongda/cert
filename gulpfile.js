const gulp = require('gulp');
const sftp = require('gulp-sftp');
const gutil = require("gulp-util");
const webpack = require("webpack");
const webpackConfig = require('./webpack.config.js')
const BUILD = 'server/public/build/';
const SFTP = require('./server/config').SFTP;

gulp.task('webpack', function(callback) {
  webpack(webpackConfig, function(err, stats) {
    if (err) throw new gutil.PluginError("webpack:build", err);
    gutil.log("[webpack:build]", stats.toString({ colors: true }));
    callback();
  });
});

gulp.task('upload', ['webpack'], function() {
  return gulp
    .src(BUILD + '*.js')
    .pipe(sftp({
        host: SFTP.host,
        user: SFTP.user,
        pass: SFTP.pass,
        remotePath: SFTP.remotePath + BUILD
    }))
});
