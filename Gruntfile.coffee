module.exports = (grunt)->
	grunt.initConfig
		## setup tasks
		pkg : grunt.file.readJSON 'package.json'

		# TODO: compile everything into dist dir

		connect:
			test:
				options:
					port:8123
					hostname: 'localhost'
					keepalive: true

		uglify:
			src:
				options:
					beautify: true
					mange: false
					compress: false
					sourceMap: true
				files:
					'dist/nlp.js': 'src/**/*.js'
			test:
				options:
					beautify: true
					mangle: false
					compress: false
					sourceMap: true
				files:
					'dist/nlp.spec.js' : 'test/**/*.js'
			benchmark:
				options:
					beautify: true
					mangle: false
					compress: false
					sourceMap: true
				files:
					'dist/nlp.benchmark.js' : 'benchmark/**/*.js'

		# build documentation into doc dir
		jsdoc:
			dist:
				src: ['src/**/*.js'],
				dest: 'doc'
				options:
					template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/'
					configuration: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json'

		mocha:
			test:
				options:
					urls: ['http://localhost:8123/test/']
					run: true
		watch:
  			dev:
  				options:
  					atBegin : true
  				files: ['src/**/*.js', 'test/**/*.js']
  				tasks: ['clear', 'test']

	# load tasks
	grunt.loadNpmTasks 'grunt-mocha'
	grunt.loadNpmTasks 'grunt-clear'
	grunt.loadNpmTasks 'grunt-jsdoc'
	grunt.loadNpmTasks 'grunt-contrib-uglify'
	grunt.loadNpmTasks 'grunt-closure-tools'
	grunt.loadNpmTasks 'grunt-contrib-watch'
	grunt.loadNpmTasks 'grunt-append-sourcemapping'
	grunt.loadNpmTasks 'grunt-contrib-connect'

	grunt.registerTask 'server' ,  ['connect:test']
	grunt.registerTask 'test',  ['mocha:test']
	grunt.registerTask 'build', ['uglify:src']
