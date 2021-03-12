var express = require('express');
var app = express();
var http = require('http');
var server = http.Server(app);

app.use(express.static('public'));
app.use(express.static('dist'));
app.use('/processParticles.js', express.static('server/processParticles.js'));

const homePageRouter = require('./routes/home');
const gamePageRouter = require('./routes/index');
const sockets = require('./server/socketHandle.js');

var path = require('path');
global.appRoot = path.resolve(__dirname);
global.viewPath = appRoot + "/public/views";

//  Connect all our routes to our application
app.use('/', gamePageRouter);
app.use('/home', homePageRouter);

app.set('port', 8000);
server.listen(8000, function() {
    console.log('Starting server on port 8000');
});

sockets.init(server);