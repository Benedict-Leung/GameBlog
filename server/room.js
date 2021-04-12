/**
 * Room class stores all player's info including socket, position and rotation
 */
class Room {
    constructor() {
        this.playerSockets = new Map(); // Stores socket (key: id, value: socket)
        this.players = new Map(); // Stores players position and rotation
        this.scores = new Map();
    }

    /**
     * Add player to the room
     * 
     * @param {String} name             // Player's name
     * @param {Socket} playerSocket     // Player's socket
     */
    addPlayer(playerSocket, name) {
        this.playerSockets.set(playerSocket.id, playerSocket);
        this.players.set(playerSocket.id, { name: name,
                                            position: {x: 0, y: 1.2, z: 0}, 
                                            rotation: {x: 0, y: 0, z: 0},
                                            turretRotation: 0,
                                            health: 150,
                                            onShoot: false});
        this.scores.set(name, 0);
        this.updateScores();
    }
    
    /**
     * Remove player from room
     * 
     * @param {Socket} playerSocket      // Player's socket
     */
    removePlayer(playerSocket) {
        this.scores.delete(this.players.get(playerSocket.id).name);
        this.playerSockets.delete(playerSocket.id);
        this.players.delete(playerSocket.id);
        this.updateScores();
    }

    /**
     * Update player info
     * 
     * @param {Object[]} data       // Stores player's position and rotation
     */
    updatePlayer(data) {
        if (this.players.get(data.id) != undefined) {
            this.players.set(data.id, { name: this.players.get(data.id).name,
                                        position: data.position,
                                        rotation: data.rotation, 
                                        turretRotation: data.turretRotation,
                                        health: data.health,
                                        onShoot: data.onShoot});
        }
    }

    /**
     * Decrease player's health
     * 
     * @param {String} data     // Player's id
     */
    hitPlayer(data) {
        this.players.get(data[1]).health = Math.max(0, this.players.get(data[1]).health - (20 + Math.round(Math.random() * 5)));

        // If player's health is zero, display report and add score to attacker
        if (this.players.get(data[1]).health == 0) {
            this.scores.set(this.players.get(data[0]).name, this.scores.get(this.players.get(data[0]).name) + 1);

            this.playerSockets.get(data[1]).emit("displayReport", this.players.get(data[0]).name);
            this.updateScores();
        }
    }

    /**
     * Respawn the player
     * 
     * @param {String} data     // Player's id
     */
    respawnPlayer(data) {
        this.playerSockets.forEach((socket, id) => {
            if (id != data) {
                socket.emit("respawn", data);
            }
        });
    }

    /**
     * Send message to all players
     * 
     * @param {String} data     // Message to be broadcast
     */
    messagePlayers(data) {
        let player = this.players.get(data[0]);

        if (player != undefined) {
            this.playerSockets.forEach((socket, id) => {
                socket.emit("message", `<b>${player.name}:</b> ${data[1]}`);
            });
        }
    }

    /**
     * Emit all player's info to all sockets
     */
    update() {
        this.playerSockets.forEach((socket, id) => {
            socket.emit("update", Array.from(this.players));
        });
    }

    /**
     * Sends scores to all players
     */
    updateScores() {
        this.playerSockets.forEach((socket, id) => {
            socket.emit("leaderboard", Array.from(this.scores));
        });
    }

    /**
     * Get players info
     */
    getPlayers() {
        return this.players;
    }

    /**
     * Get players' scores
     */
    getScores() {
        return this.scores;
    }
}

module.exports = Room; 