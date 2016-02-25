  (function(window, io) {
    window.addEventListener('DOMContentLoaded', function() {

      var httpPort = 'http://192.168.104.177:3000' || 'http://192.168.1.77:3000'
      var socket = io('http://192.168.104.177:3000');

      socket.on('connect', function() {
        // call the server-side function 'adduser' and send one parameter (value of prompt)
        var obj = {
          prompt: prompt("What's your name?"),
          windowX: window.innerWidth,
          windowY: window.innerHeight
        }
        socket.emit('adduser', obj);
      });
      var game = document.getElementById('game');

      //////////
      //Affichage //
      //////////

      socket.on('affichage', function(data) {
        $('#rooms').html(data.room);
        $('#users').html(data.username);
      });

      socket.on('majScore', function(data) {
        console.log(data)
        $('#score').html(data)

      })

      socket.on('global', function(data) {
        $('#nameUtil').fadeIn(200, function() {
          $(this).html('<p> Le joueur : '+ data + 'a été touché !</p>').fadeOut();
        });
      });

      /////////
      //Chat //
      /////////

      // listener, whenever the server emits 'updatechat', this updates the chat body
      socket.on('updatechat', function(username, data) {
        $('#conversation').append('<b>' + username + ':</b> ' + data + '<br>');
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

      ///////////
      //////////////
      ////Game // //
      //////////////
      ///////////


      //////////
      //Truck //
      //////////

      socket.on('newTruck', function(data) {
        // var CamionElement = document.getElementById(data.id);
        // console.log('test')
        var CamionElement = document.createElement('img');
        CamionElement.id = data.id
        game.appendChild(CamionElement)
        data.creation = function() {
          CamionElement.setAttribute('src', 'images/truck.png');
          CamionElement.style.top = data.y + "px";
          CamionElement.className = data.className;
          CamionElement.style.left = data.x + "px";
          CamionElement.style.height = data.height + "px";
          CamionElement.style.width = data.width + "px";
          CamionElement.style.position = data.position;
          return data; // pour le chainage
        };

        data.creation();

        socket.on('majTruck', function(data) {
          // var CamionElement = document.getElementById(data.id);
          CamionElement.style.left = data.x + 'px';
          CamionElement.style.top = data.y + 'px';
          CamionElement.style.width = data.width + 'px';
          CamionElement.style.height = data.height + 'px';
        })

      });
      //////////
      //carre //
      //////////
      socket.on('creerLesAutresCarres', function(data) {
        for (index in data) {

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
        setInterval(function() {
          socket.emit('collision', {
            id: HTMLDivElement.id,
            top: parseInt(HTMLDivElement.style.top),
            left: parseInt(HTMLDivElement.style.left)
          });
        }, 250)
      });

      socket.on('detruireCarre', function(data) {
        var HTMLDivElement = window.document.getElementById(data.id);
        if (HTMLDivElement) {
          HTMLDivElement.remove();
        };
      });

      //creer n'importe quel carré
      socket.on('creerMonCarre', function(data, username, score) {

        var HTMLDivElement = window.document.getElementById(data.id);
        $(HTMLDivElement).append('<p>' + data.name + '</p>') // seul l'utilisateur voit ca

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
          // var motoGame = $('#' + data.id).position();
          switch (e.keyCode) {
            case 39:
              e.preventDefault();
              HTMLDivElement.style.left = parseFloat(HTMLDivElement.style.left) + 10 + 'px';
              if (HTMLDivElement.style.left >= '600px') {
                HTMLDivElement.style.left = '600px'
              }
              break;
            case 37:
              e.preventDefault();
              HTMLDivElement.style.left = parseFloat(HTMLDivElement.style.left) - 10 + 'px'
              if (HTMLDivElement.style.left <= '200px') {
                HTMLDivElement.style.left = '200px'
              }
              break;
          }

          socket.emit('changerPositionnementDeMonCarre', {
            id: HTMLDivElement.id,
            top: parseInt(HTMLDivElement.style.top),
            left: parseInt(HTMLDivElement.style.left)
          });
        });


      });

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
        // $(HTMLDivElement).append('<p>' + data.name + '</p>') // seul l'utilisateur connecté après voit le pseudo des autres
      });

      socket.on('changerPositionnementDeSonCarre', function(data) {
        var HTMLDivElement = window.document.getElementById(data.id);
        if (HTMLDivElement) {
          HTMLDivElement.style.top = data.top;
          HTMLDivElement.style.left = data.left;
        }
      });
      socket.on('deco', function(data) {
        console.log(data)
        $('#truck').remove();
        $('#table').show('slow');

      });
    });
  })(window, io);