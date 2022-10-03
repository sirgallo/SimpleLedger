module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    ts: {
      simpleledger: {
        tsconfig: {
          tsconfig: './tsconfig.json',
          passThrough: true,
        },
        options: {
          rootDir: './',
          outDir: './dist'
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-ts');

  grunt.registerTask('default', [
    'ts'
  ]);
};