$(document).ready(function () {
    const CANVAS = require('../../server/canvas.js');
    const io = require('socket.io-client');

    let canvas = null;
    var socket = io();

    // Create canvas when connected
    socket.on('connect', function() {        
        canvas = new CANVAS().create(socket.id, socket);
        socket.emit('join', 'User ' + Math.floor(Math.random() * 100));
        canvas.init();
    })
    
    socket.on('message', function (data) {
        $('body').prepend(`<div style="position: fixed">${data}</div>`);
    });
    
    // Update canvas
    socket.on('update', (data) => {
        canvas.update(data);
    });

    // Remove player
    socket.on('remove', (data) => {
        canvas.removePlayer(data);
    });
    
});