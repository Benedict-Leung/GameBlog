let FBXLoader = require('three/examples/jsm/loaders/FBXLoader.js');
let THREE = require('three');

/**
 * Player class
 */
class Player {
    /**
     * 
     * @param {String} id           // Socket id
     * @param {THREE.Mesh} model    // Three.js mesh
     */
    constructor(id, model, mixer, clock, action) {
        this.id = id;
        this.model = model;
        this.mixer = mixer;
        this.clock = clock;
        this.action = action;
        this.onShoot = false;
        this.rotation = null;
        
        if (this.model != undefined) {
            this.quaternionValues = [...this.model.animations[0].tracks[1].values];
            this.positionValues = [...this.model.animations[0].tracks[0].values];
        }
    }

    /**
     * Create a player
     * 
     * @param {String} id       // Socket id
     */
    async create(id) {
        const loader = new FBXLoader.FBXLoader();
        const model = await loader.loadAsync('./assets/tank.fbx');

        let mesh = model.children[1];
        mesh.castShadow = true;
        mesh.position.set(0, 0.82, 0);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.multiplyScalar(0.01); 

        mesh.animations = model.animations;

        mesh.animations[0].tracks.forEach((track) => {
            if (track.name === "Tank.scale" || track.name === "Tank.position") {
                for (var i = 0; i < track.values.length; i++) {
                    track.values[i] *= 0.01;
                }
            }
        });

        // Animation mixer
        let clock = new THREE.Clock();
        const mixer = new THREE.AnimationMixer(mesh);
        const action = mixer.clipAction(mesh.animations[0]);
        action.setLoop( THREE.LoopOnce );

        let player = new Player(id, mesh, mixer, clock, action);
        
        player.mixer.addEventListener('finished', () => {
            player.action.stop();
            player.setRotation(player.rotation.x, player.rotation.y, player.rotation.z);
            player.onShoot = false;
        });
        return player;
    }

    shoot() {
        this.onShoot = true;
        let quaternion = this.getModel().animations[0].tracks[1].values;
        this.rotation = this.getRotation();

        // Change animation's quaternion rotation based on player's rotation
        for (var i = 0; i < quaternion.length; i += 4) {
            let q1 = new THREE.Quaternion(this.quaternionValues[i], this.quaternionValues[i + 1], this.quaternionValues[i + 2], this.quaternionValues[i + 3]);
            let q2 = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, this.getRotation().y, 0, 'XYZ' ));
            q2.multiply(q1).normalize();
            
            quaternion[i] = q2.x;
            quaternion[i + 1] = q2.y;
            quaternion[i + 2] = q2.z;
            quaternion[i + 3] = q2.w;
        }
        let position = this.getModel().animations[0].tracks[0].values;
        
        // Change animation's position based on player's position
        for (i = 0; i < position.length; i += 3) {
            let headingX = Math.sin(this.getRotation().y) * this.positionValues[i + 2];
            let headingZ = Math.cos(this.getRotation().y) * this.positionValues[i + 2];
            position[i] = headingX + this.getPosition().x;
            position[i + 2] = headingZ + this.getPosition().z;
        }
        this.action.play(); // Play animation
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

    // Return id
    getID() {
        return this.id;
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

    isShoot() {
        return this.onShoot;
    }

    update() {
        this.mixer.update( this.clock.getDelta() );
    }
}

module.exports = Player;