  (function(window, io) {
    window.addEventListener('DOMContentLoaded', function() {

      var httpPort = 'http://192.168.104.177:3000' || 'http://192.168.1.77:3000'
      var socket = io('http://192.168.104.177:3000');

      socket.on('connect', function() {
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        socket.emit('adduser', prompt("What's your name?"), window.innerWidth, window.innerHeight);
      });
      var game = document.getElementById('game');

      /////
      // Chat//
      /////

      // listener, whenever the server emits 'updatechat', this updates the chat body
      socket.on('updatechat', function(username, data, room, score) {
        $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
        $('#rooms').append(room);

      });

      // on load of page
      $(function() {
        // when the client clicks SEND
        $('#datasend').click(function() {
          var message = $('#data').val();
          $('#data').val('');
          // tell server to execute 'sendchat' and send along one parameter
          socket.emit('sendchat', message);
        });
        // when the client hits ENTER on their keyboard
        $('#data').keypress(function(e) {
          if (e.which == 13) {
            $(this).blur();
            $('#datasend').focus().click();
          }
        });
      });

      /////
      // Game//
      /////
      socket.on('global', function(data) {
        $('#game').html('<p>' + data + '</p>');
      });

          var t = setInterval(Math.round(Math.random() + 1),1000)
          
      //dis camion
      socket.on('newTruck', function(data) {
        var CamionElement = document.createElement('img')
        data.creation = function() {
          CamionElement.setAttribute('src', 'images/truck.png');
          CamionElement.style.top = data.y + "px";
          CamionElement.className = data.className
          CamionElement.style.left = data.x + "px";
          CamionElement.style.height = data.height + "px";
          CamionElement.style.width = data.width + "px";
          CamionElement.style.position = data.position;
          game.appendChild(CamionElement)
          return data;
        };
        data.animation = function() {
          data.y = data.y + 2;
          data.height = data.height + 0.9;
          data.width = data.width + 1;
          console.log(t)
          if (t == 1) {
            data.x -= 1;
          } else if (t == 2) {
            data.x -= 2;
          }
          if (data.y >= game.offsetHeight - data.height) { // if end of the map
            data.y = 200 + data.step;
            data.width = 40;
            data.height = 40;
            data.x = 520;
          }
          CamionElement.style.left = data.x + 'px';
          CamionElement.style.top = data.y + 'px';
          CamionElement.style.width = data.width + 'px';
          CamionElement.style.height = data.height + 'px';

          window.requestAnimationFrame(function() {
            data.animation();
          });
        };


        data.creation().animation();
        var objSend = {
          y: data.y,
          x: data.x,
          width: data.width,
          height: data.height
        }
        socket.emit('majTruck', objSend)
      });

      // premier joueur voit tout //deuxieme voit seulement le troisime joueur bouger et troisieme joueur ne voit rien 
      socket.on('creerLesAutresCarres', function(data) {
        for (index in data) {
          // for (var index = 0; index < data.length; index++) {

          var HTMLDivElement = window.document.getElementById(data[index].id);
          if (!HTMLDivElement) {
            var HTMLDivElement = window.document.createElement('div');
            HTMLDivElement.id = data[index].id;
            game.appendChild(HTMLDivElement);
          }

          HTMLDivElement.style.top = data[index].top;
          HTMLDivElement.style.left = data[index].left;
          HTMLDivElement.style.width = data[index].width;
          HTMLDivElement.style.height = data[index].height;
          HTMLDivElement.style.position = data[index].position;
          HTMLDivElement.style.backgroundColor = data[index].backgroundColor;
          $(HTMLDivElement).append('<p>' + data[index].name + '</p>') // permet au premiers joueurs de voir le numéro des joueur qui se connectent après
        }
        // }
      });

      socket.on('detruireCarre', function(data) {
        var HTMLDivElement = window.document.getElementById(data.id);
        if (HTMLDivElement) {
          HTMLDivElement.remove();
        };
      });

      //creern'importe quel carré
      socket.on('creerMonCarre', function(data, username, score) {

        var HTMLDivElement = window.document.getElementById(data.id);
        $(HTMLDivElement).append('<p>' + data.name + '</p>') // seul l'utilisateur voit ca

        $('#score').append('<p>score: ' + score + '</p>');
        if (username != 'SERVER') {
          $('#users').html('<p>Username:' + username + '</p>');
          $('#tableauScore').append('<div class="ready">' + username + ' Are you ready??</div>');

        }
        if (!HTMLDivElement) {
          var HTMLDivElement = window.document.createElement('div');
          HTMLDivElement.id = data.id;
          game.appendChild(HTMLDivElement);
        }
        HTMLDivElement.style.top = data.top;
        HTMLDivElement.style.left = data.left;
        HTMLDivElement.style.width = data.width;
        HTMLDivElement.style.height = data.height;
        HTMLDivElement.style.position = data.position;
        HTMLDivElement.style.backgroundColor = data.backgroundColor;


        window.addEventListener('keydown', function(e) {
          var motoGame = $('#' + data.id).position();
          switch (e.keyCode) {
            case 39:
              e.preventDefault();

              // HTMLDivElement.style.left = data.left + 10 + 'px';
              $('#' + data.id).css({
                'left': motoGame.left + 10 + 'px'
              });

              break;
            case 37:
              e.preventDefault();
              // HTMLDivElement.style.left = data.left-10 + 'px';
              $('#' + data.id).css({
                'left': motoGame.left - 10 + 'px'
              });
              break;
          }

          socket.emit('changerPositionnementDeMonCarre', {
            id: HTMLDivElement.id,
            top: HTMLDivElement.style.top,
            left: HTMLDivElement.style.left
          });

        });

      });
      //premier joueur peut afficher son carré sur le deuxiemen joueur mais le deusieme, joueuyr n'affiche pas son carré si desactiver

      socket.on('creerSonCarre', function(data) {
        var HTMLDivElement = window.document.getElementById(data.id);
        if (!HTMLDivElement) {
          var HTMLDivElement = window.document.createElement('div');
          HTMLDivElement.id = data.id;
          game.appendChild(HTMLDivElement);
        }

        HTMLDivElement.style.top = data.top;
        HTMLDivElement.style.left = data.left;
        HTMLDivElement.style.width = data.width;
        HTMLDivElement.style.height = data.height;
        HTMLDivElement.style.position = data.position;
        HTMLDivElement.style.backgroundColor = data.backgroundColor;
        $(HTMLDivElement).append('<p>' + data.name + '</p>') // seul l'utilisateur connecté après voit le pseudo des autres
      });

      // pour le joueur qui se connecte après si on desactive ce bout de code on voit pas son carre s'afficher a l'écran
      // permet de voir le mouvement de l'autre carré
      socket.on('changerPositionnementDeSonCarre', function(data) {
        var HTMLDivElement = window.document.getElementById(data.id);
        if (HTMLDivElement) {
          HTMLDivElement.style.top = data.top;
          HTMLDivElement.style.left = data.left;
        }

      });

    });
  })(window, io);
  console.log('test')