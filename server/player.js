let FBXLoader = require('three/examples/jsm/loaders/FBXLoader.js');

/**
 * Player class
 */
class Player {
    /**
     * 
     * @param {String} id           // Socket id
     * @param {THREE.Mesh} model    // Three.js mesh
     */
    constructor(id, model) {
        this.id = id;
        this.model = model;
    }

    /**
     * Create a player
     * 
     * @param {String} id       // Socket id
     */
    async create(id) {
        const loader = new FBXLoader.FBXLoader();
        const model = await loader.loadAsync('./tank.fbx');

        let mesh = model.children[1];
        mesh.castShadow = true;
        mesh.position.set(0, 0.82, 0);
        mesh.scale.multiplyScalar(0.01); 

        mesh.animations = model.animations;

        mesh.animations[0].tracks.forEach((track) => {
            if (track.name === "Tank.scale" || track.name === "Tank.position") {
                for (var i = 0; i < track.values.length; i++) {
                    track.values[i] *= 0.01;
                }
            }
        });

        let player = new Player(id, mesh);
        return player;
    }

    // Set mesh's position
    setPosition(x = this.model.position.x, y = this.model.position.y, z = this.model.position.z) {
        this.model.position.x = Number(Number(x).toFixed(3));
        this.model.position.y = Number(Number(y).toFixed(3));
        this.model.position.z = Number(Number(z).toFixed(3));
    }

    // Set mesh's rotation
    setRotation(x = this.model.rotation.x, y = this.model.rotation.y, z = this.model.rotation.z) {
        this.model.rotation.x = Number(Number(x).toFixed(3));
        this.model.rotation.y = Number(Number(y).toFixed(3));
        this.model.rotation.z = Number(Number(z).toFixed(3));
    }

    // Return mesh
    getModel() {
        return this.model;
    }

    // Return position
    getPosition() {
        return {x: this.model.position.x, y: this.model.position.y, z: this.model.position.z}
    }

    // Return rotation
    getRotation() {
        return {x: this.model.rotation.x, y: this.model.rotation.y, z: this.model.rotation.z}
    }
}

module.exports = Player;