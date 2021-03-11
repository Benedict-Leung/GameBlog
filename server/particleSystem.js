let THREE = require('three');

/**
 * Custom Particle System for THREE.Scene
 */
class ParticleSystem {
    /**
     * Create a particle system in the scene
     * 
     * @param {THREE.Scene} scene       // The scene to add particles with
     */
    constructor(scene) {
        // Initiate web worker
        this.process = new SharedWorker("./processParticles.js");
        
        // Load uniform variables for shaders
        let uniforms = {
            pointTexture: { value: new THREE.TextureLoader().load( "./assets/particle.png" ) }
        };

        // Initiate shaders and get shader code from index.html
        const shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: document.getElementById('vertexshader').textContent,
            fragmentShader: document.getElementById('fragmentshader').textContent,

            blending: THREE.AdditiveBlending,
            depthTest: true,
            transparent: true,
            vertexColors: true
        });
        this.sent = false; // To track if the worker has finished processing
        this.scene = scene;
        this.geometry = new THREE.BufferGeometry();
        this.system = new THREE.Points(this.geometry, shaderMaterial);
        this.scene.add(this.system);
        
        // Set the buffers when worker has finished processing
        this.process.port.onmessage = (e) => {
            this.setBuffers(e.data.index, e.data.position, e.data.color, e.data.size, e.data.direction, e.data.lifetime);
            this.sent = false;
        };
    }

    /**
     * Create particles to mimic an explosion
     * 
     * @param {Number} x    // x-coordinate of the explosion
     * @param {Number} y    // y-coordinate of the explosion 
     * @param {Number} z    // z-coordinate of the explosion 
     */
    createExplosion(x, y, z) {
        // Initialize arrays
        let indices = [], positions = [], colors = [], sizes = [], directions = [], lifetimes = [];

        // Get existing buffer data
        if (this.geometry.attributes.position != undefined) {
            indices = [...this.geometry.attributes.index.array];
            positions = [...this.geometry.attributes.position.array];
            colors = [...this.geometry.attributes.color.array];
            sizes = [...this.geometry.attributes.size.array];
            directions = [...this.geometry.attributes.direction.array];
            lifetimes = [...this.geometry.attributes.lifetime.array];
        }
        const particles = 100;
        const color = new THREE.Color();
        
        // Generate data for particles
        for (let i = 0; i < particles; i++) {
            // Generate random xyz for the direction of the particle
            var theta = Math.random() * 2.0 * Math.PI;
            var phi = Math.acos(2.0 * Math.random() - 1.0);
            var x1 = Math.sin(phi) * Math.cos(theta);
            var y1 = Math.sin(phi) * Math.sin(theta);
            var z1 = Math.cos(phi);
            
            // Index of the particle
            indices.push(i);

            // Position of the particle
            positions.push(x);
            positions.push(y);
            positions.push(z);

            // Direction of the particle
            directions.push(x1);
            directions.push(y1);
            directions.push(z1);

            // Color of the particle (randomized hue value)
            color.setHSL(0.03 * Math.random(), 0.9, 0.5);
            colors.push(color.r, color.g, color.b);

            // Size of the particle
            sizes.push(5);
            
            // Lifetime of the particle (randomized based on index)
            lifetimes.push(Math.random() * particles / 8);
        }
        this.setBuffers(indices, positions, colors, sizes, directions, lifetimes);
    }

    /**
     * Updates the particle's information using webworker
     */
    update() {
        // Sends the data to worker if there are particles and if not processing previous data
        if (this.geometry.attributes.position != undefined) {
            let positions = [...this.geometry.attributes.position.array];
                        
            if (positions.length % 3 == 0 && positions.length != 0 && !this.sent) {
                this.sent = true;
                this.process.port.postMessage(this.geometry.attributes);
            }  
        }
    }

    /**
     * Load data into the appropriate buffers
     * 
     * @param {Number[]} indices        // Indices of the particles (Takes 1 index for each particle)
     * @param {Number[]} positions      // Positions of the particles (Takes 3 indices (x, y and z) for each particle)
     * @param {Number[]} colors         // Colors of the particles (Takes 3 indices (red, green and blue) for each particle)
     * @param {Number[]} sizes          // Sizes of the particles (Takes 1 index for each particle)
     * @param {Number[]} directions     // Directions of the particles (Takes 3 indices (x, y and z) for each particle)
     * @param {Number[]} lifetimes      // Lifetimes of the particles (Takes 1 index for each particle)
     */
    setBuffers(indices, positions, colors, sizes, directions, lifetimes) {
        this.geometry.setAttribute('index', new THREE.Float32BufferAttribute(indices, 1));
        this.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
        this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        this.geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1).setUsage(THREE.DynamicDrawUsage));
        this.geometry.setAttribute('direction', new THREE.Float32BufferAttribute(directions, 3));
        this.geometry.setAttribute('lifetime', new THREE.Float32BufferAttribute(lifetimes, 1).setUsage(THREE.DynamicDrawUsage));
        
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.attributes.size.needsUpdate = true;
        this.geometry.attributes.lifetime.needsUpdate = true;
    }
}

module.exports = ParticleSystem;