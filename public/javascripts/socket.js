  (function(window, io) {
    window.addEventListener('DOMContentLoaded', function() {

      var httpPort = 'http://192.168.104.177:3000' || 'http://192.168.1.77:3000'
      var socket = io('http://192.168.1.77:3000');

      socket.on('connect', function() {
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        socket.emit('adduser', prompt("What's your name?"), window.innerWidth, window.innerHeight);
      });

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
          document.body.appendChild(CamionElement)
          return data;
        };
        data.animation = function() {
          data.y = data.y;//+ data.step
          if (data.y >= window.innerHeight) {
            data.y = window.innerHeight*0.3; //taille de la fenetre
            // data.x = Math.floor(Math.random() * 200);
          }
          $(CamionElement).animate({ transform: 'scale(2,0.5)'},200);
          CamionElement.style.left = data.x + 'px';
          CamionElement.style.top = data.y + 'px';
          window.requestAnimationFrame(function() {
            data.animation();
          });
        };
        data.creation().animation();
        var objSend = {
          y : data.y,
          x : data.x
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
            window.document.body.appendChild(HTMLDivElement);
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
          window.document.body.appendChild(HTMLDivElement);

        }

        window.addEventListener('click', function(event) {
          HTMLDivElement.style.top = (event.clientY - (parseFloat(HTMLDivElement.style.height) / 2)) + 'px';
          HTMLDivElement.style.left = (event.clientX - (parseFloat(HTMLDivElement.style.width) / 2)) + 'px';

          socket.emit('changerPositionnementDeMonCarre', {
            id: HTMLDivElement.id,
            top: HTMLDivElement.style.top,
            left: HTMLDivElement.style.left
          });

        });


        HTMLDivElement.style.top = data.top;
        HTMLDivElement.style.left = data.left;
        HTMLDivElement.style.width = data.width;
        HTMLDivElement.style.height = data.height;
        HTMLDivElement.style.position = data.position;
        HTMLDivElement.style.backgroundColor = data.backgroundColor;

      });
      //premier joueur peut afficher son carré sur le deuxiemen joueur mais le deusieme, joueuyr n'affiche pas son carré si desactiver

      socket.on('creerSonCarre', function(data) {
        var HTMLDivElement = window.document.getElementById(data.id);
        if (!HTMLDivElement) {
          var HTMLDivElement = window.document.createElement('div');
          HTMLDivElement.id = data.id;
          window.document.body.appendChild(HTMLDivElement);
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
        };

      });

    });
  })(window, io);
  console.log('test')