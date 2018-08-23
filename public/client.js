let socket, rooms, roomButtons;

let mouse = null,
    screen = 0,
    a = document.getElementById('a'),
    ctx= a.getContext('2d'),
    rect = a.getBoundingClientRect();

//Buttons for room :D
function Button (x, y, height, width, text, room) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.room = room;
    this.width = width;
    this.text = text;
    this.hovered = false;
    this.setText = function (text) {
      this.text = text;
    };
    this.setHovered = function (mouseX, mouseY) {
        this.hovered = mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height;
    };
    this.click = function (fn) {
       if (this.hovered){ fn(this.room); console.log('Joined ' + this.room.roomName); };
    };
    this.render = function () {
        ctx.beginPath();
        ctx.fillStyle = this.hovered ? "blue" : "#E9967A";
        ctx.fillRect(this.x,this.y, this.width, this.height);
        ctx.stroke();
        ctx.fillStyle="black";
        ctx.fillText(this.text, this.x + 20, this.y + 20);
    };
}

function bind() {
    socket.on("rooms-available", function (response) {
        roomButtons = response.map(function (room, index) {
           return new Button(270, 90 + (40 * index), 30, 400, room.roomName + ' -- Players: ' + room.players.length + '/10', room, socket);
        });
    });
    socket.on('joined-room', function () {
       screen = 1;
    });
    socket.on('update-rooms', function (rooms, index) {
       roomButtons.forEach(function (button) {
         rooms.forEach(function (room) {
             if(room.roomName === button.room.roomName) {
                 button.setText(room.roomName + ' -- Players: ' + room.players.length + '/10');
                 console.log('updated room!');
             }
         });
       });
    });
}

function init() {

    socket = io({upgrade: false, transports: ["websocket"]});

    bind();

    ctx.font="20px Georgia";

    function clr()  {ctx.clearRect(0, 0, a.width, a.height);}

    setInterval(function (e) {
        clr();
        switch (screen) {
            case 0:
                roomButtons.forEach(function (button) {button.render();});
                break;
            case 1:
                ctx.fillText("Game Screen",10,50);
                break;
            case 2:
                ctx.fillText("Death Screen",10,50);
        }
    }, 33);

    onclick = function (e) {
        switch (screen) {
            case 0:
                roomButtons.forEach(function (button) {
                  button.click(function (room) {
                      socket.emit('join', room);
                  });
                });
                break;
            case 1:
                // screen = 2;
                break;
            case 2:
                // screen = 0;
        }
    };

    oninput = function (e) {
        console.log(e);
        switch (screen) {
            case 0:

        }
    };

    onmousemove = function (e) {
        switch (screen) {
            case 0:
                roomButtons.forEach(function (button) {
                    button.setHovered(e.clientX - rect.left,e.clientY - rect.top);
                });
                break;
        }
    };

}

window.addEventListener("load", init, false);

