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
        this.scores.set(playerSocket.id, 0);
        this.updateScores();
    }
    
    /**
     * Remove player from room
     * 
     * @param {Socket} playerSocket      // Player's socket
     */
    removePlayer(playerSocket) {
        this.scores.delete(playerSocket.id);
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
            this.scores.set(data[0], this.scores.get(data[0]) + 1);

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
            let scores = new Map([...this.scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5));
            scores = Array.from(scores);
            let rank = 1;

            for (let score of scores) {
                let player = this.players.get(score[0]);

                if (player != undefined) 
                    score[0] = player.name;
                score.unshift(rank)
                rank += 1;
            }
            socket.emit("leaderboard", scores);
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