module.exports = function(io) {
	var app = require('express');
	var router = app.Router();
	var carres = {};
	router.get('/', function(req, res, next) {
		var jeu = maDb.collection('jeu');
		jeu.find({}).toArray(function() {

		})
		res.render('jeu', {
			title: 'Un test'
			// login: 
		})
	});

	// usernames which are currently connected to the chat
	var usernames = {};
	// rooms which are currently available in chat

	var rooms = [{
			name: 'room1',
			profil: []
		}
	];
	var carres = {};
	io.sockets.on('connection', function(socket) {
		var Camion = {
			y: 200,
			step: Math.round(Math.random() + 1),
			x: 600,
			id: 'truck',
			width: 40,
			className: 'camion',
			height: 40,
			position: 'absolute',
			choice: Math.round(Math.random() * 5),
			animationCamion: function() {
				var that = this;
				// var ti = setInterval(function() {
				that.y += 3;
				that.x += that.tabPosition[that.choice];
				that.height = that.height + 0.9;
				that.width = that.width + 1;

				if (that.y + that.height >= 600) { // position basse de la div jeu
					that.choice = Math.round(Math.random() * 4);
					that.y = 200;
					that.width = 40;
					that.height = 40;
					that.x = 600;
					for (index in carres) {
						if (!carres[index].isTouched) {
							carres[index].score += 200
							io.to(carres[index].id).emit('majScore', carres[index].score)
						}
						carres[index].isTouched = false;
						//End of the game
						var endOfGame = {
							score: carres[index].score,
							utilisateur: carres[index].name,
							camion: socket.camion
						};
						if (carres[index].score > 500) {
							io.sockets.in(socket.room.name).emit('endOfGame', endOfGame);
						}
					}
				}
				var checkCollision = function() {
					for (index in carres) {
						//check if a moto is on conflict with the truck
						if (carres[index].top + carres[index].height >= Camion.y + Camion.height && carres[index].top <= Camion.y + Camion.height && carres[index].left + carres[index].width >= Camion.x && carres[index].left + carres[index].width <= Camion.x + Camion.width) {
							carres[index].isTouched = true;
							if(carres[index].score < 500){
							carres[index].score -= 50;
							}
							io.sockets.in(socket.room.name).emit('global', carres[index].name);
							io.to(carres[index].id).emit('majScore', carres[index].score)
						}
					}
				};
				checkCollision();
				io.sockets.in(socket.room.name).emit('majTruck', that);
				// }, 16);
			},
			tabPosition: [-3, -2, -1, 0, 1],
		};

		console.log('connéecté');
		socket.on('adduser', function(data) {
			// store the username in the socket session for this client
			socket.username = data.prompt;
			socket.screenHeight = data.windowX;
			socket.screenWidth = data.windowY;
			socket.score = 0;
			socket.camion = Camion;

			usernames[socket.username] = socket.username;
			for (var i = 0; i < rooms.length; i++) {
				if (rooms[i].profil.length < 2) {
					rooms[i].profil.push(data.prompt);
					socket.room = rooms[i];
					break;
				}
			}
			// send client to room 1
			socket.join(socket.room.name);
			gameData = {
				username: socket.username,
				room: socket.room.name,
				tailleX: socket.screenWidth,
				tailleY: socket.scrennHeight,
				message: "En attente d'un autre joueur"
			};

			//launch the party
			// socket.emit('majScore', socket.score)
			socket.emit('affichage', gameData);
			if (socket.room.profil.length == 2) {
				io.sockets.in(socket.room.name).emit('newTruck', socket.camion);
				socket.camion.animationCamion();
				socket.on('newCoor', function(data) {
					setTimeout(function() {
						socket.camion.animationCamion();
					}, 10)
				});

				io.sockets.in(socket.room.name).emit('global', gameData.messageWait);
			}

			/////////
			//chat //
			/////////
			// echo to client they've connected
			socket.emit('updatechat', 'Server', 'you have connected to ' + socket.room.name, socket.room.name);
			// echo to room 1 that a person has connected to their room
			socket.broadcast.to(socket.room.name).emit('updatechat', 'Server', socket.username + ' has connected to this room');
			var randomColor = "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";

			socket.on('sendchat', function(data) {
				// we tell the client to execute 'updatechat' with 2 parameters
				io.sockets.in(socket.room.name).emit('updatechat', socket.username, data);
			});
			var carre = {
				top: 500,
				left: 480,
				id: socket.id,
				isTouched: false,
				score: socket.score,
				name: socket.username,
				width: 70,
				height: 100,
				position: 'absolute',
				backgroundColor: randomColor,
			};

			carres[carre.id] = carre;

			// mon carré
			socket.emit('creerMonCarre', carre);
			//celui de tout ceux connécté
			io.sockets.in(socket.room.name).emit('creerLesAutresCarres', carres);
			//envoyé mon carré a tous ceux connecté
			socket.broadcast.to(socket.room.name).emit('creerSonCarre', carre);
			// enregisntre les dernieres positions de tous les carré
			socket.on('changerPositionnementDeMonCarre', function(data) {
				if (carres[data.id]) {
					carres[data.id].top = data.top;
					carres[data.id].left = data.left;
				}
				socket.broadcast.to(socket.room.name).emit('changerPositionnementDeSonCarre', data);
			});

			socket.on('collision', function(data) {
				if (carres[data.id]) {
					carres[data.id].top = data.top;
					carres[data.id].left = data.left;
				}

			});

		}); // connection

		//when the user disconnects.. perform this
		socket.on('disconnect', function() {
			console.log('passé par déconnection')
			io.emit('deco', socket.camion)
			if (socket.room) {
				for (var i = 0; i < 2; i++) {
					if (socket.username == socket.room.profil[i]) {
						socket.room.profil.splice(i, 1);
					}
				}
				socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
				// socket.leave(socket.room.name);
				// delete usernames[socket.username];
				// update list of users in chat, client-side
				delete socket.username;
			}
			var jeu = maDb.collection('jeu');
			for (index in carres) {
				jeu.insert({
					login: carres[index].name,
					score: carres[index].score
				})
				if (!io.sockets.connected[carres[index].id]) {
					io.emit('detruireCarre', carres[index]);
					delete carres[index];
				}
			}
			// remove the username from global usernames list
		});
	});

	return router; // pour express do not touch
}