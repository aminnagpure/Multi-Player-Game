module.exports = function(grunt) {

	grunt.initConfig({
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: [{ // C'est ici que l'on définit le dossier que l'on souhaite importer
					"expand": true,
					"cwd": "public/stylesheets/",
					"src": ["*.scss"],
					"dest": "public/stylesheets/",
					"ext": ".css"
				}]
			}
		},
		imagemin: {
			png: {
				options: {
					optimizationLevel: 9
				},
				files: [{
					// Set to true to enable the following options…
					expand: true,
					// cwd is 'current working directory'
					cwd: 'staticFiles/uploads/',
					src: ['**/*.png'],
					// Could also match cwd line above. i.e. project-directory/img/
					dest: 'staticFiles/uploads/compressed/',
					ext: '.png'
				}]
			},
			jpg: {
				options: {
					progressive: true
				},
				files: [{
					// Set to true to enable the following options…
					expand: true,
					// cwd is 'current working directory'
					cwd: 'staticFiles/uploads/',
					src: ['**/*.{jpg,jpeg}'],
					// Could also match cwd. i.e. project-directory/img/
					dest: 'staticFiles/uploads/compressed/',
					ext: '.jpg'
				}]
			}
		},
		concat: {
			options: {
				separator: ';', // permet d'ajouter un point-virgule entre chaque fichier concaténé.
			},
			dist: {
				src: ['/public/javascript/background.js', 'public/javascript/intro.js', 'public/javascript/perso.js'], // la source
				dest: 'public/js/built.js' // la destination finale
			}
		},
		uglify: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['/public/javascript/background.js', 'public/javascript/intro.js', 'public/javascript/perso.js'],
				dest: 'public/javascript/built.js'
			}
		},
		watch: {
			// scripts: {
			// 	files: 'public/javascript/*.js', // tous les fichiers JavaScript de n'importe quel dossier
			// 	tasks: ['uglify:dist']
			// },
			styles: {
				files: '**/*.scss', // tous les fichiers Sass de n'importe quel dossier
				tasks: ['sass:dist']
			}
		}
	});
	grunt.loadNpmTasks('grunt-sass'); // utiliser grunt sass et non contrib
	grunt.loadNpmTasks('grunt-contrib-concat'); // Voilà l'ajout.
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');


	grunt.registerTask('default', ['watch', 'dev']); // Oui, je conseille de toujours compiler une fois avant de lancer watch.
	grunt.registerTask('dev', ['sass:dist'
		// , 'concat:dist', 'imagemin'
		]);
	grunt.registerTask('dist', ['sass:dist', 'uglify:dist']);
	grunt.registerTask('test', ['concat:dist', 'uglify:dist']);
};