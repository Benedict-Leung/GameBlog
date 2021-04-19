/**
 * Initializes socket handler and room
 * 
 * @param {http.Server} server 
 */
function init(server) {
    var socketIO = require("socket.io");
    let ROOM = require("./room.js");
    
    var io = socketIO(server);
    let room = new ROOM()
    
    // Socket handlers
    io.on("connection", function(socket) {
        // Add player to room
        socket.on("join", function (data) {
            room.addPlayer(socket, data);
            io.sockets.emit("message", `${data} has joined the game.`);
            socket.broadcast.emit("addPlayer", {id: socket.id, name: data});
        });

        // Get initial players from room
        socket.on("getRoom", function () {
            socket.emit("create", Array.from(room.getPlayers()));
        });
        
        // Send player's info to the room
        socket.on("input", function(data) {
            room.updatePlayer(data);
        });

        // Create explosion
        socket.on("hit", function(data) {
            io.sockets.emit("createExplosion", data);
        });

        // Hit player
        socket.on("hitPlayer", function(data) {
            room.hitPlayer(data);
        });

        // Respawn player
        socket.on("respawn", function (data) {
            room.respawnPlayer(data);
        });

        // Chat to players
        socket.on("message", function (data) {
            room.messagePlayers(data);
        });
        
        // Remove player from room
        socket.on("disconnect", function (data) {
            room.removePlayer(socket);
            io.sockets.emit("remove", socket.id);
        });
    });
    
    // Update room 60 times per second
    setInterval(function() {
        room.update();
    }, 1000 / 60);
}

module.exports.init = init;