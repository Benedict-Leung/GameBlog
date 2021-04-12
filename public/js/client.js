$(document).ready(function () {
    const CANVAS = require("../../server/canvas.js");
    const LEADERBOARD = require("../../server/leaderboard.js");
    const io = require("socket.io-client");

    let canvas = undefined;
    let leaderboard = new LEADERBOARD();
    var socket = io();

    // Get room info when connected
    socket.on("connect", function() {        
        socket.emit("getRoom", "");
    });

    // Create canvas
    socket.on("create", function(data) {
        let username = "User " + Math.floor(Math.random() * 100);
        new CANVAS().create(socket.id, socket, data).then((c) => {
            canvas = c;
            c.init(username);
            socket.emit("join", username);
        });
    });
    
    // Display message
    socket.on("message", function (data) {
        $(".messageContainer").append(`<div class = "message">${data}</div>`);
        $(".messageContainer").scrollTop($(".messageContainer").height());
    });

    // Create explosion
    socket.on("createExplosion", (data) => {
        if (canvas.particleSystem != undefined) {
            canvas.particleSystem.createExplosion(data.x, data.y, data.z);
        }
    });
    
    // Update canvas
    socket.on("update", (data) => {
        if (canvas != null)
            canvas.update(data);
    });

    // Add player
    socket.on("addPlayer", (data) => {
        canvas.addPlayer(data.id, data.name, {x: 0, y: 1.2, z: 0}, {x: 0, y: 0, z: 0});
    });

    // Remove player
    socket.on("remove", (data) => {
        canvas.removePlayer(data);
    });

    // Respawn player
    socket.on("respawn", (data) => {
        canvas.respawnPlayer(data);
    });

    // Display Report
    socket.on("displayReport", (data) => {
        canvas.displayReport(data);
    });

    // Update leaderboard
    socket.on("leaderboard", (data) => {
        leaderboard.update(data);
    });
});