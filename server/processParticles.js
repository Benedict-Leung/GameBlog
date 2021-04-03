/**
 * Process particles
 */
onconnect = function(event) {
    let port = event.ports[0];

    port.onmessage = function(e) {
        const time = Date.now() * 0.005;

        // Get data
        let indices = [...e.data.index.array];
        let positions = [...e.data.position.array];
        let colors = [...e.data.color.array];
        let sizes = [...e.data.size.array];
        let directions = [...e.data.direction.array];
        let lifetimes = [...e.data.lifetime.array];

        // Add the direction to the position of the particle
        for (var i = 0; i < positions.length; i++) {
            positions[i] += directions[i] * 0.3;
        }
        
        // Change size and decrease lifetime
        for (i = 0; i < sizes.length; i++) {
            sizes[i] = 10.0 * (Math.sin(0.1 * indices[i] + time));
            lifetimes[i]--;
        }

        // If the lifetime is less than zero and size is less than 0.1, remove the particle from the system
        for (i = 0; i < lifetimes.length; i++) {
            if (lifetimes[i] < 0.0 && sizes[i] < 0.1) {
                indices.splice(i, 1);
                positions.splice(i * 3, 3);
                colors.splice(i * 3, 3);
                sizes.splice(i, 1);
                directions.splice(i * 3, 3);
                lifetimes.splice(i, 1);
            }
        }
        // Return back the processed data
        port.postMessage({index: indices, position: positions, color: colors, size: sizes, direction: directions, lifetime: lifetimes});
    };
};
    