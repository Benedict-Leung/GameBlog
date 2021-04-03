$(document).ready(function () {
    const CANVAS = require('../../server/canvas.js');
    const io = require('socket.io-client');

    let canvas = null;
    var socket = io();

    // Create canvas when connected
    socket.on('connect', function() {        
        socket.emit('getRoom', '');
    });

    // Create canvas
    socket.on('create', function(data) {
        new CANVAS().create(socket.id, socket, data).then((c) => {
            canvas = c;
            c.init();
            socket.emit('join', 'User ' + Math.floor(Math.random() * 100));
        });
    });
    
    // Display message
    socket.on('message', function (data) {
        $('body').prepend(`<div style="position: fixed">${data}</div>`);
    });

    // Create explosion
    socket.on('createExplosion', (data) => {
        if (canvas.particleSystem != undefined) {
            canvas.particleSystem.createExplosion(data.x, data.y, data.z);
        }
    });
    
    // Update canvas
    socket.on('update', (data) => {
        if (canvas != null)
            canvas.update(data);
    });

    // Add player
    socket.on('addPlayer', (data) => {
        canvas.addPlayer(data, {x: 0, y: 1.2, z: 0}, {x: 0, y: 0, z: 0});
    });

    // Remove player
    socket.on('remove', (data) => {
        canvas.removePlayer(data);
    });
    
});