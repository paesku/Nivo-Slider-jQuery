// karma.conf.js
module.exports = function(config) {
    config.set({
        basePath: '../',
        frameworks: ['jasmine-jquery','jasmine'],
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'src/jquery.nivo.slider.js',
            'src/**/*.spec.js',
            'spec/fixtures/*.html'
        ],
        exclude: [
        ],
        preprocessors: {},
        reporters: ['dots'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: true
    });
};
