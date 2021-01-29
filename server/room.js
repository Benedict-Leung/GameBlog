/**
 * Room class stores all player's info including socket, position and rotation
 */
class Room {
    constructor() {
        this.playerSockets = new Map(); // Stores socket (key: id, value: socket)
        this.players = new Map();
    }

    /**
     * Add player to the room
     * 
     * @param {Socket} playerSocket      // Player's socket
     */
    addPlayer(playerSocket) {
        this.playerSockets.set(playerSocket.id, playerSocket);
        this.players.set(playerSocket.id, {position: {x: 0, y: 0.82, z: 0}, rotation: {x: 0, y: 0, z: 0}});
    }
    
    /**
     * Remove player from room
     * 
     * @param {Socket} playerSocket      // Player's socket
     */
    removePlayer(playerSocket) {
        this.playerSockets.delete(playerSocket.id);
        this.players.delete(playerSocket.id);
    }

    /**
     * Update player info
     * 
     * @param {Object[]} data       // Stores player's position and rotation
     */
    updatePlayer(data) {
        this.players.set(data.id, {position: data.position, rotation: data.rotation});
    }

    /**
     * Emit all player's info to all sockets
     */
    update() {
        this.playerSockets.forEach((socket, id) => {
            socket.emit('update', Array.from(this.players));
        });
    }
}

module.exports = Room; 