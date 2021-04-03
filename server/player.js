let FBXLoader = require('three/examples/jsm/loaders/FBXLoader.js');
let THREE = require('three');

/**
 * Player class
 */
class Player {
    /**
     * 
     * @param {*} id                            // Socket id
     * @param {THREE.Mesh} model                // Mesh
     * @param {THREE.AnimationMixer} mixer      // Animation mixer
     * @param {THREE.Clock} clock               // Three.Clock
     * @param {THREE.AnimationAction} action    // Shooting action
     */
    constructor(id, model, mixer, clock, action) {
        this.id = id;
        this.model = model;
        this.mixer = mixer;
        this.clock = clock;
        this.action = action;
        this.onShoot = false;
        this.rotation = {x: 0, y: 0, z: 0};
        this.position = {x: 0, y: 1.2, z: 0};
        this.turretRotation = 0;
        
        if (this.model != undefined) {
            this.quaternionValues = [...this.model.animations[0].tracks[1].values];
            this.positionValues = [...this.model.animations[0].tracks[0].values];
            this.turretValues = [...this.model.animations[0].tracks[7].values];
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
        mesh.position.set(0, 1.2, 0);
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
        action.setLoop(THREE.LoopOnce);
        console.log(mesh);
        let player = new Player(id, mesh, mixer, clock, action);

        player.mixer.addEventListener('finished', () => {
            player.action.stop();
            player.setPosition(player.position.x, player.position.y, player.position.z);
            player.setRotation(player.rotation.x, player.rotation.y, player.rotation.z);
            player.setTurretRotation(player.turretRotation);
            player.onShoot = false;
        });       
        return player;
    }

    /**
     * Initiate shooting animation
     */
    shoot() {
        this.onShoot = true;
        this.updatePositionAnimation();
        this.updateRotateAnimation();
        this.updateTurretRotateAnimation();
        this.action.play(); // Play animation
    }

    /**
     * Set player's position
     * 
     * @param {Number} x    // x-coordinate
     * @param {Number} y    // y-coordinate
     * @param {Number} z    // z-coordinate
     */
    setPosition(x = this.position.x, y = this.position.y, z = this.position.z) {
        this.position = {x: x, y: y, z: z};
        this.model.position.x = x;
        this.model.position.y = y;
        this.model.position.z = z;

        if (this.action.isRunning()) {
            let time = this.action.time;
            this.action.stop();

            this.updatePositionAnimation();

            this.action.time = time;
            this.action.play();
        }
    }

    /**
     * Set player's rotation
     * 
     * @param {Number} x    // x rotation
     * @param {Number} y    // y rotation
     * @param {Number} z    // z rotation
     */
    setRotation(x = this.rotation.x, y = this.rotation.y, z = this.rotation.z) {
        this.rotation = {x: x, y: y, z: z}
        this.model.rotation.x = x;
        this.model.rotation.y = y;
        this.model.rotation.z = z;

        if (this.action.isRunning()) {
            let time = this.action.time;
            this.action.stop();

            this.updateRotateAnimation();

            this.action.time = time;
            this.action.play();
        }
    }

    /**
     * Set player's turret rotation
     * 
     * @param {Number} angle    // y rotation
     */
     setTurretRotation(angle) {
        this.turretRotation = angle;
        let q1 = new THREE.Quaternion(-0.06351142353437648, 0, 0, 0.9979811115851027);
        let q2 = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, angle, 0, 'XYZ' ));
        q2.multiply(q1).normalize();
        this.model.children[4].quaternion.set(q2.x, q2.y, q2.z, q2.w);
        
        if (this.action.isRunning()) {
            let time = this.action.time;
            this.action.stop();

            this.updateTurretRotateAnimation();

            this.action.time = time;
            this.action.play();
        }
    }

    /**
     * Update quaternion values of the animation
     */
    updateRotateAnimation() {
        let quaternion = this.getModel().animations[0].tracks[1].values;
        this.rotation = this.getRotation();
        
        // Change animation's quaternion rotation based on player's rotation
        for (var i = 0; i < quaternion.length; i += 4) {
            let q1 = new THREE.Quaternion(this.quaternionValues[i], this.quaternionValues[i + 1], this.quaternionValues[i + 2], this.quaternionValues[i + 3]);
            let q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.getRotation().y, 0, 'XYZ'));

            let headingX = Math.sin(this.turretRotation);
            let headingZ = Math.cos(this.turretRotation);
            let xRotate = new THREE.Euler().setFromQuaternion(q1).x;

            let q3 = new THREE.Quaternion().setFromEuler(new THREE.Euler(xRotate * headingZ, 0, xRotate * -headingX, 'XYZ'));
            q2.multiply(q3).normalize();
            
            quaternion[i] = q2.x;
            quaternion[i + 1] = q2.y;
            quaternion[i + 2] = q2.z;
            quaternion[i + 3] = q2.w;
        }
    }

    /**
     * Update position values of the animation
     */
    updatePositionAnimation() {
        let position = this.getModel().animations[0].tracks[0].values;

        // Change animation's position based on player's position
        for (var i = 0; i < position.length; i += 3) {
            let headingX = Math.sin(this.getRotation().y + this.getTurretRotation()) * this.positionValues[i + 2];
            let headingZ = Math.cos(this.getRotation().y + this.getTurretRotation()) * this.positionValues[i + 2];
            position[i] = headingX + this.position.x;
            position[i + 1] = this.positionValues[i + 1] + 0.38;
            position[i + 2] = headingZ + this.position.z;
        }
    }

    /**
     * Update turret values of the animation
     */
    updateTurretRotateAnimation() {
        let quaternion = this.getModel().animations[0].tracks[7].values;
        this.turretRotation = this.getTurretRotation();

        for (var i = 0; i < quaternion.length; i += 4) {
            let q1 = new THREE.Quaternion(this.turretValues[i], this.turretValues[i + 1], this.turretValues[i + 2], this.turretValues[i + 3]);
            let q2 = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, this.turretRotation, 0, 'XYZ' ));
            q2.multiply(q1).normalize();
            
            quaternion[i] = q2.x;
            quaternion[i + 1] = q2.y;
            quaternion[i + 2] = q2.z;
            quaternion[i + 3] = q2.w;
        }
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
        return this.position;
    }

    // Return rotation
    getRotation() {
        return this.rotation;
    }

    getTurretRotation() {
        return this.turretRotation;
    }

    // If in shooting animation
    isShoot() {
        return this.onShoot;
    }

    // Update player's mixer
    update() {
        this.mixer.update(this.clock.getDelta());
    }
}

module.exports = Player;