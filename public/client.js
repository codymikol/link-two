"use strict";
(() => {
    let socket, 
        buttons, 
        message,
        score,
        points = {
            tie: 0,
            win: 0,
            loose: 0
        };

    function disableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].setAttribute("disabled", "disabled");
        }
    }

    function enableButtons() {
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].removeAttribute("disabled");
        }
    }

    function setMessage(text) {
        message.innerHTML = text;
    }

    function displayScore(text) {
        score.innerHTML = [
            `<h1>${text}</h1>`,
            `Wins: ${points.win}`,
            `Looses: ${points.loose}`,
            `Ties: ${points.tie}`
        ].join("<br>");
    }

    function bind() {

        socket.on("start", () => {
            enableButtons();
            setMessage(`Round ${points.win + points.loose + points.tie + 1}`);
        });

        socket.on("win", () => {
            points.win++;
            displayScore("You win!");
        });

        socket.on("loose", () => {
            points.loose++;
            displayScore("You loose!");
        });

        socket.on("tie", () => {
            points.tie++;
            displayScore("Tie!");
        });

        socket.on("end", () => {
            disableButtons();
            setMessage("Waiting for opponent...");
        });

        socket.on("connect", () => {
            disableButtons();
            setMessage("Waiting for opponent...");
        });

        socket.on("disconnect", () => {
            disableButtons();
            setMessage("Connection lost!");
        });

        socket.on("error", () => {
            disableButtons();
            setMessage("Connection error!");
        });

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", (e) => {
                disableButtons();
                socket.emit("guess", i + 1);
            }, false);
        }
    }

    function init() {
        socket = io({ upgrade: false, transports: ["websocket"] });
        buttons = document.getElementsByTagName("button");
        message = document.getElementById("message");
        score = document.getElementById("score");
        disableButtons();
        bind();
    }

    window.addEventListener("load", init, false);

})();
