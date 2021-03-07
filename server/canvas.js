let THREE = require('three');
let PLAYER = require('./player.js');
let CONTROL = require('../public/js/control.js');
let Stats = require('three/examples/jsm/libs/stats.module.js');

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
     */
    constructor(id, socket, scene, camera, spotLight, players) {
        this.id = id;
        this.socket = socket;
        this.scene = scene;
        this.camera = camera;
        this.spotLight = spotLight;
        this.players = players;   // Stores all players position and rotation
    }

    /**
     * Setup three.js canvas
     * 
     * @param {String} id 
     * @param {Socket} socket 
     */
    async create(id, socket, playersInfo) {
        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xa0a0a0);
        scene.fog = new THREE.Fog(0xa0a0a0, 10, 100);

        // Camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.set(0, 4, -6);
        camera.lookAt(0, 0.82, 0)

        // Ambient light
        const ambient = new THREE.AmbientLight(0x404040, 4);
        scene.add( ambient );

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

        // Spotlight helper
        let lightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(lightHelper);

        // Shadow helper
        let shadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera);
        scene.add(shadowCameraHelper);

        // Shadow camera helper
        const helper = new THREE.CameraHelper(spotLight.shadow.camera);
        scene.add(helper);

        // Ground
        let material = new THREE.MeshPhongMaterial({color: 0x808080, dithering: true});
        let geometry = new THREE.PlaneBufferGeometry(100, 100, 100, 100);

        let ground = new THREE.Mesh(geometry, material);
        ground.rotation.x = - Math.PI * 0.5;
        ground.receiveShadow = true;
        scene.add( ground );

        material = new THREE.MeshBasicMaterial( {color: 0x87CEEB, side: THREE.DoubleSide, dithering: true} );
        geometry = new THREE.PlaneBufferGeometry(100, 50, 100, 100);
        let plane = new THREE.Mesh( geometry, material );
        plane.receiveShadow = true;
        plane.position.set(0, 25, -50);
        scene.add( plane );

        plane = new THREE.Mesh( geometry, material );
        plane.receiveShadow = true;
        plane.position.set(0, 25, 50);
        scene.add( plane )

        plane = new THREE.Mesh( geometry, material );
        plane.receiveShadow = true;
        plane.position.set(50, 25, 0);
        plane.rotation.y = Math.PI * 0.5;
        scene.add( plane )

        plane = new THREE.Mesh( geometry, material );
        plane.receiveShadow = true;
        plane.position.set(-50, 25, 0);
        plane.rotation.y = Math.PI * 0.5;
        scene.add( plane )

        // Grid
        const grid = new THREE.GridHelper(100, 40, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        scene.add(grid);
        
        let players = new Map();

        for (var i = 0; i < playersInfo.length; i++) {
            if (playersInfo[i][0] != id) {
                new PLAYER().create(playersInfo[i][0]).then((player) => {
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
     */
    init() {
        // WebGL renderer
        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        
        // Change aspect ratio when window changes size
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false );
        
        // Create player and controls for the user
        new PLAYER().create(this.id).then((player) => {
            let controls = new CONTROL();
            controls.create();
            this.scene.add(player.getModel());    
    
            // Stats
            var stats = new Stats.default();
            document.body.appendChild( stats.dom );
            stats.begin();
            
            // Animate function
            const animate = () => {
                stats.update(); // Update stats
                
                if (!player.isShoot()) {
                    updatePositionRotation(); // Update position and rotation only when not shooting
                }
                
                // Shooting animation function
                if (controls.getInput().shoot && !player.isShoot()) {
                    player.shoot();
                }
                renderer.render(this.scene, this.camera);
                player.update();
                requestAnimationFrame(animate);
            };

            // Update player's position and rotation
            const updatePositionRotation = () => {
                let headingX = Math.sin(player.getRotation().y);
                let headingZ = Math.cos(player.getRotation().y);

                // Move forward
                if (controls.getInput().forward) {
                    player.setPosition(player.getPosition().x + headingX * 0.1, undefined, player.getPosition().z + headingZ * 0.1);
                    this.camera.position.set(this.camera.position.x + headingX * 0.1, 4, this.camera.position.z + headingZ * 0.1);
                }

                // Move backward
                if (controls.getInput().backward) {
                    player.setPosition(player.getPosition().x - headingX * 0.1, undefined, player.getPosition().z - headingZ * 0.1);
                    this.camera.position.set(this.camera.position.x - headingX * 0.1, 4, this.camera.position.z - headingZ * 0.1);
                }

                // Change spotlight target
                if (controls.getInput().forward || controls.getInput().backward) {
                    this.spotLight.target.position.set(player.getPosition().x, player.getPosition().y, player.getPosition().z);
                }

                // Rotate left
                if (controls.getInput().left) {
                    player.setRotation(undefined, player.getRotation().y + 0.02, undefined);
                }

                // Rotate right
                if (controls.getInput().right) {
                    player.setRotation(undefined, player.getRotation().y - 0.02, undefined);
                }
                headingX = Math.sin(player.getRotation().y);
                headingZ = Math.cos(player.getRotation().y);

                // Change camera position
                if (controls.getInput().left || controls.getInput().right) {
                    this.camera.position.set(player.getPosition().x + headingX * -6, 4, player.getPosition().z + headingZ * -6);
                    this.camera.lookAt(player.getPosition().x, player.getPosition().y, player.getPosition().z);
                }

                // Emit position and rotation info 
                if (controls.getInput().forward || controls.getInput().backward || controls.getInput().left || controls.getInput().right) {
                    this.socket.emit('input', {id: this.id, position: player.getPosition(), rotation: player.getRotation()});
                }
            }
            animate();
        });
    }

    /**
     * Added player when another user has joined the server
     * 
     * @param {String} id           // Socket id
     * @param {Number} position     // Player's position
     * @param {Number} rotation     // Player's rotation
     */
    async addPlayer(id, position, rotation) {
        this.players.set(id, 'Loading');
        new PLAYER().create(id).then((newPlayer) => {
            this.players.set(id, newPlayer);
            this.scene.add(newPlayer.getModel());
            newPlayer.setPosition(position.x, position.y, position.z);
            newPlayer.setRotation(rotation.x, rotation.y, rotation.z);
        });
    }

    /**
     * Remove player when user has left the server
     * 
     * @param {String} id       // Socket id
     */
    removePlayer(id) {
        this.scene.remove(this.players.get(id).getModel());
        this.players.delete(id);
    }

    /**
     * Update the canvas
     * 
     * @param {Object[]} data       // Stores all player's position and rotation
     */
    update(data) {
        data.forEach(player => {
            if (player[0] != this.id) {
                // Add player if it does not exist in the player map
                if (this.players.get(player[0]) != undefined && this.players.get(player[0]) != 'Loading') {
                    this.players.get(player[0]).setPosition(player[1].position.x, player[1].position.y, player[1].position.z);
                    this.players.get(player[0]).setRotation(player[1].rotation.x, player[1].rotation.y, player[1].rotation.z);
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