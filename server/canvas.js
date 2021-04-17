let THREE = require("three");
let PLAYER = require("./player.js");
let CONTROL = require("../public/js/control.js");
let CSS3DObject = require("three/examples/jsm/renderers/CSS3DRenderer");
let ParticleSystem = require("./particleSystem.js");

/**
 * Three.js Canvas
 */
class Canvas {
    /**
     *  
     * @param {String} id                   // ID of the socket
     * @param {Socket} socket               // Socket from socket.io
     * @param {THREE.Scene} scene           // Three.js scene
     * @param {THREE.Camera} camera         // Three.js camera
     * @param {THREE.SpotLight} spotLight   // Three.js spotlight
     * @param {Map} players                 // Other players present
     */
    constructor(id, socket, scene, camera, spotLight, players) {
        this.id = id;
        this.socket = socket;
        this.scene = scene;
        this.camera = camera;
        this.spotLight = spotLight;
        this.player = undefined;
        this.players = players;   // Stores all players position and rotation
        this.particleSystem = null;
        this.controls = new CONTROL();
    }

    /**
     * Setup three.js canvas
     * 
     * @param {String} id           // Client's socket id
     * @param {Socket} socket       // Client's socket
     * @param {Map} playersInfo     // Client's player
     */
    async create(id, socket, playersInfo) {
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color().setHSL(0.6, 0, 1);
        scene.fog = new THREE.Fog(scene.background, 1, 200); 

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 4, -6);
        camera.lookAt(0, 1.2, 0);

        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambient);

        // Spotlight
        let spotLight = new THREE.SpotLight(0x404040, 2);
        spotLight.position.set(0, 10, 0);
        spotLight.angle = Math.PI / 3;
        spotLight.penumbra = 1;

        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        scene.add(spotLight);
        scene.add(spotLight.target);

        // Hemishere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);
        
        // Dome
        const vertexShader = document.getElementById("skyvertexShader").textContent;
        const fragmentShader = document.getElementById("skyfragmentShader").textContent;
        const uniforms = {
            "topColor": {value: new THREE.Color(0x0077ff) },
            "bottomColor": {value: new THREE.Color().setHSL(0.095, 1, 0.75)},
            "offset": {value: 33},
            "exponent": {value: 0.6}
        };
        uniforms[ "topColor" ].value.copy(hemiLight.color);
        scene.fog.color.copy(uniforms[ "bottomColor" ].value);

        const skyGeo = new THREE.SphereGeometry(100, 32, 15);
        const skyMat = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide
        });
        const sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);

        // Ground
        const textureLoader = new THREE.TextureLoader();

        function floorSettigs (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(3, 3);
        }
        let alphaMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_opacity.jpg", floorSettigs);
        let aoMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_ambientOcclusion.jpg", floorSettigs);
        let envMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_basecolor.jpg", floorSettigs);
        let displacementMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_height.png", floorSettigs);
        let normalMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_normal.jpg", floorSettigs);
        let metalnessMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_metallic.jpg", floorSettigs);
        let roughnessMap = textureLoader.load("assets/floor/Sci-fi_Floor_002_roughness.jpg", floorSettigs);

        let material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            alphaMap: alphaMap,
            alphaTest: 0.5,
            normalMap: normalMap,
            aoMap: aoMap,
            displacementMap: displacementMap,
            map: envMap,
            metalnessMap: metalnessMap,
            roughnessMap: roughnessMap
        });
        let geometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1);

        let ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = -Math.PI * 0.5;
        ground.receiveShadow = true;
        scene.add(ground);

        // Walls
        function processTexture (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 1);
        }
        aoMap = textureLoader.load("assets/metal/Sci-fi_Walll_001_ambientOcclusion.png", processTexture);
        envMap = textureLoader.load("assets/metal/Sci-fi_Walll_001_basecolor.png", processTexture);
        displacementMap = textureLoader.load("assets/metal/Sci-fi_Walll_001_height.png", processTexture);
        normalMap = textureLoader.load("assets/metal/Sci-fi_Walll_001_normal.png", processTexture);
        metalnessMap = textureLoader.load("assets/metal/Sci-fi_Walll_001_metallic.png", processTexture);
        roughnessMap = textureLoader.load("assets/metal/Sci-fi_Walll_001_roughness.png", processTexture);

        material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            normalMap: normalMap,
            aoMap: aoMap,
            displacementMap: displacementMap,
            map: envMap,
            metalnessMap: metalnessMap,
            roughnessMap: roughnessMap,
            dithering: true
        });

        geometry = new THREE.PlaneBufferGeometry(100, 10, 100, 100);

        let plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.position.set(0, 5, -50);
        scene.add(plane);

        plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.position.set(0, 5, 50);
        plane.rotation.y = Math.PI;
        scene.add(plane)

        plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.position.set(50, 5, 0);
        plane.rotation.y = Math.PI * -0.5;
        scene.add(plane)

        plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = true;
        plane.position.set(-50, 5, 0);
        plane.rotation.y = Math.PI * 0.5;
        scene.add(plane)

        // Players from the room
        let players = new Map();

        for (var i = 0; i < playersInfo.length; i++) {
            if (playersInfo[i][0] != id) {
                new PLAYER().create(playersInfo[i][0], playersInfo[i][1].name).then((player) => {
                    players.set(player.getID(), player);
                    scene.add(player.getModel());
                });
            }
        }
        let canvas = new Canvas(id, socket, scene, camera, spotLight, players);
        return canvas;
    }

    /**
     * Shows the canvas and start the animation
     * 
     * @param name  // Client's name
     */
    init(name) {
        // WebGL renderer
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // CSS3D renderer
        const labelRenderer = new CSS3DObject.CSS3DRenderer();
        labelRenderer.setSize( window.innerWidth, window.innerHeight );
        labelRenderer.domElement.style.position = "absolute";
        labelRenderer.domElement.style.top = "0px";
        
        // Change aspect ratio when window changes size
        window.addEventListener("resize", () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
        
        // Custom Particle System
        this.particleSystem = new ParticleSystem(this.scene);
        
        this.scene.traverse(function(object) {
            object.frustumCulled = false;
        });
        const raycaster = new THREE.Raycaster();

        // Create player and controls for the user
        new PLAYER().create(this.id, name).then((player) => {
            this.player = player;
            let previousShoot = false;
            this.scene.add(player.getModel());
            
            // Animate function
            const animate = () => {				
                // Move model
                updatePositionRotation(); // Update position and rotation only when not shooting
                updateShoot(); // Update Shooting animation
                updateTurret(); // Update turret

                player.update(); // Update player animation (for tracking shooting animation)
                this.particleSystem.update(); // Update particle system

                renderer.render(this.scene, this.camera);
                labelRenderer.render(this.scene, this.camera);
                requestAnimationFrame(animate);
            };

            // Update player's position and rotation
            const updatePositionRotation = () => {
                let headingX = Math.sin(player.getRotation().y);
                let headingZ = Math.cos(player.getRotation().y);

                // Move forward
                if (this.controls.getInput().forward) {
                    player.setPosition(player.getPosition().x + headingX * 0.1, undefined, player.getPosition().z + headingZ * 0.1);
                    this.camera.position.set(this.camera.position.x + headingX * 0.1, 4, this.camera.position.z + headingZ * 0.1);
                }

                // Move backward
                if (this.controls.getInput().backward) {
                    player.setPosition(player.getPosition().x - headingX * 0.1, undefined, player.getPosition().z - headingZ * 0.1);
                    this.camera.position.set(this.camera.position.x - headingX * 0.1, 4, this.camera.position.z - headingZ * 0.1);
                }

                // Change spotlight target
                if (this.controls.getInput().forward || this.controls.getInput().backward) {
                    this.spotLight.target.position.set(player.getPosition().x, player.getPosition().y, player.getPosition().z);
                }

                // Rotate left
                if (this.controls.getInput().left) {
                    player.setRotation(undefined, player.getRotation().y + 0.02, undefined);
                }

                // Rotate right
                if (this.controls.getInput().right) {
                    player.setRotation(undefined, player.getRotation().y - 0.02, undefined);
                }
                headingX = Math.sin(player.getRotation().y + player.getTurretRotation());
                headingZ = Math.cos(player.getRotation().y + player.getTurretRotation());

                // Change camera position
                if (this.controls.getInput().left || this.controls.getInput().right || this.controls.getInput().turretLeft || this.controls.getInput().turretRight) {
                    this.camera.position.set(player.getPosition().x + headingX * -6, 4, player.getPosition().z + headingZ * -6);
                    this.camera.lookAt(player.getPosition().x, player.getPosition().y, player.getPosition().z);
                }

                // Emit position and rotation info 
                if (this.controls.getInput().forward || this.controls.getInput().backward || this.controls.getInput().left || this.controls.getInput().right || this.controls.getInput().turretLeft || this.controls.getInput().turretRight) {
                    this.socket.emit("input", {id: this.id, position: player.getPosition(), rotation: player.getRotation(), turretRotation: player.getTurretRotation(), health: player.getHealth(), onShoot: player.isShoot()});
                }
            }

            // Shooting animation function
            const updateShoot = () => {
                if (this.controls.getInput().shoot && !player.isShoot()) {
                    // Initiate shooting animation
                    player.shoot();
                    previousShoot = true;
                    this.socket.emit("input", {id: this.id, position: player.getPosition(), rotation: player.getRotation(), turretRotation: player.getTurretRotation(), health: player.getHealth(), onShoot: player.isShoot()});
                    
                    let headingX = Math.sin(player.getRotation().y + player.getTurretRotation());
                    let headingZ = Math.cos(player.getRotation().y + player.getTurretRotation());
                    
                    // Get objects that intersects with line of fire (where the player is facing)
                    raycaster.set(new THREE.Vector3(player.getPosition().x, 1.1, player.getPosition().z), new THREE.Vector3(headingX, 0, headingZ).normalize());
                    raycaster.near = 1;
                    raycaster.far = 200;
                    const intersects = raycaster.intersectObjects(this.scene.children);

                    // If there are objects in line of fire, send location to the socket
                    if (intersects.length > 0) {
                        for (let intersect of intersects) {
                            if (intersect.object.type == "Mesh") {
                                this.socket.emit("hit", {x: intersects[0].point.x, y: intersects[0].point.y, z: intersects[0].point.z});
    
                                for (let [id, p] of this.players.entries()) {
                                    if (intersect.object.uuid == p.model.uuid) {
                                        this.socket.emit("hitPlayer", [this.id, id]);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                // Send player model"s data to socket if done shooting
                if (previousShoot != player.isShoot()) {
                    previousShoot = false;
                    this.socket.emit("input", {id: this.id, position: player.getPosition(), rotation: player.getRotation(), turretRotation: player.getTurretRotation(), health: player.getHealth(), onShoot: player.isShoot()});
                }
            }
            // Update turret function
            const updateTurret = () => {
                if (this.controls.getInput().turretLeft) {
                    player.setTurretRotation(player.getTurretRotation() + 0.02);
                }

                if (this.controls.getInput().turretRight) {
                    player.setTurretRotation(player.getTurretRotation() - 0.02);
                }
            }
            this.controls.create();
            document.body.appendChild(renderer.domElement);
            document.body.appendChild(labelRenderer.domElement);
            this.initChat();

            animate();
        });
    }

    /**
     * Add player when another user has joined the server
     * 
     * @param {String} id           // Socket id
     * @param {String} name         // Player's name
     * @param {Number} position     // Player's position
     * @param {Number} rotation     // Player's rotation
     */
    addPlayer(id, name, position, rotation) {
        this.players.set(id, "Loading");
        new PLAYER().create(id, name).then((newPlayer) => {
            this.players.set(id, newPlayer);
            newPlayer.setPosition(position.x, position.y, position.z);
            newPlayer.setRotation(rotation.x, rotation.y, rotation.z);
            this.scene.add(newPlayer.getModel());
        });
    }

    /**
     * Remove player when user has left the server
     * 
     * @param {String} id       // Socket id
     */
    removePlayer(id) {
        this.players.get(id).model.remove(this.players.get(id).healthContainer);
        this.players.get(id).model.remove(this.players.get(id).name);
        this.scene.remove(this.players.get(id).getModel());
        this.players.delete(id);
    }

    /**
     * Respawn the player
     * 
     * @param {String} id       // Player's id
     */
    respawnPlayer(id) {
        this.players.get(id).getModel().add(this.players.get(id).name);
        this.players.get(id).getModel().add(this.players.get(id).healthContainer);
        this.scene.add(this.players.get(id).getModel());
    }

    /**
     * Respawn the user
     */
    respawn() {
        // Reset the user and randomly place the user
        this.player.setTurretRotation(0);
        this.player.setPosition(Math.random() * 100 - 49, undefined, Math.random() * 100 - 49);

        let headingX = Math.sin(this.player.getRotation().y + this.player.getTurretRotation());
        let headingZ = Math.cos(this.player.getRotation().y + this.player.getTurretRotation());
        this.camera.position.set(this.player.getPosition().x + headingX * -6, 4, this.player.getPosition().z + headingZ * -6);
        this.camera.lookAt(this.player.getPosition().x, this.player.getPosition().y, this.player.getPosition().z);
        this.controls.create();

        this.socket.emit("input", {id: this.id, position: this.player.getPosition(), rotation: this.player.getRotation(), health: 150, turretRotation: this.player.getTurretRotation(), onShoot: false});
        this.socket.emit("respawn", this.id);
        
        this.player.model.add(this.player.name);
        this.player.model.add(this.player.healthContainer);
        this.scene.add(this.player.model);

        $(".reportBackground").remove();
    }

    /**
     * Display report
     * 
     * @param {String} player    // Player's name
     */
    displayReport(player) {
        $("body").append(`<div class='reportBackground'>
                              <div class='reportContainer'><label class='info' id='notification'>You died!</label>
                                  <label class='info' id='report'>Killed by ${player}</label>
                                  <button class='respawn'>Respawn</button>
                              </div>
                          </div>`);
        $(".respawn").click(() => {
            this.respawn();
        });
    }

    /**
     * Initializes key events to chat
     */
    initChat() {
        $(document).keyup((event) => {
            if (event.code == "Enter") {
                // Check if message input exists
                if ($(".chat input").length == 0) {
                    $(".chat").append("<input></input>");
                    $(".chat input").focus();
                    this.controls.disable();
                    
                    // Send message if enter key has presses
                    $(".chat input").keyup((e) => {
                        if (e.code == "Enter") {
                            if ($(".chat input").val() != "") {
                                this.socket.emit("message", [this.id, $(".chat input").val()]);
                            }
                            
                            if (this.player.health >= 0) {
                                this.controls.create();
                            }
                            $(".chat input").remove();
                            setTimeout(() => this.initChat(), 100);
                        }
                    });

                    $(".chat input").blur((e) => {
                        if (this.player.health >= 0) {
                            this.controls.create();
                        }
                        $(".chat input").remove();
                        this.initChat();
                    })
                }
            }
        });
    }
    
    /**
     * Update the canvas
     * 
     * @param {Object[]} data       // Stores all player's position and rotation
     */
    update(data) {
        data.forEach(player => {
            if (player[0] != this.id) {
                // Set the location of the players
                if (this.players.get(player[0]) != undefined && this.players.get(player[0]) != "Loading") {
                    this.players.get(player[0]).setHealth(player[1].health);
                    
                    // Change player's model if health is above zero. Otherwise remove from scene
                    if (this.players.get(player[0]).getHealth() > 0){
                        this.players.get(player[0]).setPosition(player[1].position.x, player[1].position.y, player[1].position.z);
                        this.players.get(player[0]).setRotation(player[1].rotation.x, player[1].rotation.y, player[1].rotation.z);
                        this.players.get(player[0]).setTurretRotation(player[1].turretRotation);

                        // Initiate shooting animation if they are shooting
                        if (!this.players.get(player[0]).isShoot() && player[1].onShoot) {
                            this.players.get(player[0]).shoot();
                        } else {
                            this.players.get(player[0]).update();
                        }
                        // Change name tag and health to looak at the client
                        this.players.get(player[0]).name.lookAt(this.camera.position);
                        this.players.get(player[0]).healthContainer.lookAt(this.camera.position);
                    } else {
                        // Remove player fomr scene
                        this.players.get(player[0]).model.remove(this.players.get(player[0]).healthContainer);
                        this.players.get(player[0]).model.remove(this.players.get(player[0]).name);
                        this.scene.remove(this.players.get(player[0]).model);
                    }
                }
            } else {
                if (this.player != undefined) {
                    // If client's health is 0, display report. Otherwise update health
                    if (player[1].health == 0 && this.player.getHealth() != -1) {
                        this.player.setHealth(-1);
                        this.player.model.remove(this.player.healthContainer);
                        this.player.model.remove(this.player.name);
                        this.scene.remove(this.player.model);
                        this.controls.disable();
                        this.initChat();
                    } else if (player[1].health > 0) {
                        this.player.setHealth(player[1].health);
                        this.player.name.lookAt(this.camera.position);
                        this.player.healthContainer.lookAt(this.camera.position);
                    }
                }
            }
        });
    }

    /**
     * Return socket ID
     */
    getID() {
        return this.id;
    }
}

module.exports = Canvas;