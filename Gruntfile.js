module.exports = function(grunt) {
	grunt.initConfig({
		express: {
			devServer: {
				options: {
					script: 'app.js'
				}
			}
		},
		clean: {
			styles: {
				options: {
					force: true
				},
				src: ['dist/styles/**/*.css']
			},
			scripts: {
				options: {
					force: true
				},
				src: ['dist/scripts/**/*']
			},
			images: {
				options: {
					force: true
				},
				src: ['dist/images/**/*']
			}
		},
		copy: {
			minimizedScripts: {
				expand: true,
				cwd: 'src/scripts/',
				src: '**/*.{min, map, compact}.js',
				dest: 'dist/scripts/'
			},
			otherImages: {
				expand: true,
				cwd: 'src/images/',
				src: ['**/*', '!{jpg, png, gif}'],
				dest: 'dist/images/'
			}
		},
		uglify: {
			jsMinimize: {
				files: [{
					expand: true,
					cwd: 'src/scripts/',
					src: ['controllers/**/*.js', '!**/*.{min, map, compact}.js'],
					dest: 'dist/scripts/',
					ext: '.min.js',
					extDot: 'last'
				}]
			}
		},
		sass: {
			cssCompile: {
				files: [{
					expand: true,
					cwd: 'src/styles/',
					src: ['*.scss', '!_*.scss'],
					dest: 'dist/styles',
					ext: '.css'
				}]
			}
		},
		imagemin: {
			imgMinimize: {
				files: [{
					expand: true,
					cwd: 'src/images/',
					src: '**/*.{jpg, png, gif}',
					dest: 'dist/images/',
					extDot: 'last'
				}]
			}
		},
		watch: {
			express: {
				files: ['app.js', 'Gruntfile.js', '**/*.json'],
				tasks: ['express:devServer'],
				options: {
					spawn: false,
					reload: true
				}
			},
			styles: {
				files: 'src/styles/**/*',
				tasks: ['clean:styles', 'sass'],
				options: {
					nospawn: true
				}
			},
			scripts: {
				files: 'src/scripts/**/*',
				tasks: ['clean:scripts', 'copy:minimizedScripts', 'uglify'],
				options: {
					nospawn: true
				}
			},
			images: {
				files: 'src/images/**/*',
				tasks: ['clean:images', 'copy:otherImages', 'imagemin'],
				options: {
					spawn: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'clean',
		'copy',
		'sass',
		'uglify',
		'imagemin',
		'express',
		'watch'
	]);
};
