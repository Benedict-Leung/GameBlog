let FBXLoader = require("three/examples/jsm/loaders/FBXLoader");
let THREE = require("three");
let CSS3DObject = require("three/examples/jsm/renderers/CSS3DRenderer");

/**
 * Player class
 */
class Player {
    /**
     * 
     * @param {String} id                            // Socket id
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
        this.health = 150;
        this.healthContainer = undefined;
        this.name = undefined;
        
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
     * @param {String} name     // Player's name
     */
    async create(id, name) {
        const loader = new FBXLoader.FBXLoader();
        const model = await loader.loadAsync("./assets/tank.fbx");

        // Edit initial mesh geometry
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
        // Name label
        const nameLabel = document.createElement("div");
        nameLabel.className = "name";
        nameLabel.textContent = name;

        // Health label
        const healthLabel = document.createElement("div");
        healthLabel.className = "health";
        healthLabel.style.width = this.health + "px";

        // Missing health label
        const missingHealthLabel = document.createElement("div");
        missingHealthLabel.className = "missingHealth";
        missingHealthLabel.style.width = (150 - this.health) + "px";

        // Health container label
        const containerLabel = document.createElement("div");
        containerLabel.style.width = "150px";
        containerLabel.style.height = "10px";
        containerLabel.appendChild(healthLabel);
        containerLabel.appendChild(missingHealthLabel);

        // Animation mixer
        let clock = new THREE.Clock();
        const mixer = new THREE.AnimationMixer(mesh);
        const action = mixer.clipAction(mesh.animations[0]);
        action.setLoop(THREE.LoopOnce);
        let player = new Player(id, mesh, mixer, clock, action);

        player.mixer.addEventListener("finished", () => {
            player.action.stop();
            player.setPosition(player.position.x, player.position.y, player.position.z);
            player.setRotation(player.rotation.x, player.rotation.y, player.rotation.z);
            player.setTurretRotation(player.turretRotation);
            player.onShoot = false;
        });
        player.name = new CSS3DObject.CSS3DObject(nameLabel);
        player.name.position.set(0, 125, 0);
        mesh.add(player.name);
        
        player.healthContainer = new CSS3DObject.CSS3DObject(containerLabel);
        player.healthContainer.position.set(0, 100, 0 );
        mesh.add(player.healthContainer); 

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
     * @param {Number} angle    // y rotation in Euler
     */
     setTurretRotation(angle) {
        this.turretRotation = angle;
        let q1 = new THREE.Quaternion(-0.06351142353437648, 0, 0, 0.9979811115851027);
        let q2 = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, angle, 0, "XYZ" ));
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
            let q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, this.getRotation().y, 0, "XYZ"));

            let headingX = Math.sin(this.turretRotation);
            let headingZ = Math.cos(this.turretRotation);
            let xRotate = new THREE.Euler().setFromQuaternion(q1).x;

            let q3 = new THREE.Quaternion().setFromEuler(new THREE.Euler(xRotate * headingZ, 0, xRotate * -headingX, "XYZ"));
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
            let q2 = new THREE.Quaternion().setFromEuler( new THREE.Euler( 0, this.turretRotation, 0, "XYZ" ));
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

    // Return turret rotation
    getTurretRotation() {
        return this.turretRotation;
    }

    // Return player's health
    getHealth() {
        return this.health;
    }

    /**
     * Set player's health
     * 
     * @param {Number} health   // Player's current health
     */
    setHealth(health) {
        this.health = health;
        let h = (health > 150) ? 150 : (health < 0) ? 0 : health;
        if (this.model.children[12] != undefined) {
            this.model.children[12].element.children[0].style.width = h + "px";
            this.model.children[12].element.children[1].style.width = (150 - h) + "px";
        }
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