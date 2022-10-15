var express = require('express');
var app = express();
var http = require('http');
var cors = require('cors');
var server = http.Server(app);
var port = process.env.PORT || 8000;

app.use(express.static('public'));
app.use(express.static('dist'));
app.use(cors());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/processParticles.js', express.static('server/processParticles.js'));

const homePageRouter = require('./routes/home');
const gamePageRouter = require('./routes/game');
const userPageRouter = require('./routes/user');
const blogPageRouter = require('./routes/blog');
const sockets = require('./server/socketHandle.js');

var path = require('path');
global.appRoot = path.resolve(__dirname);
global.viewPath = appRoot + "/public/views";

app.set('view engine', 'ejs');
app.set("views", global.viewPath);

//  Connect all our routes to our application
app.use('/game', gamePageRouter);
app.use('/', homePageRouter);
app.use('/home', homePageRouter);
app.use('/user', userPageRouter);
app.use('/blog', blogPageRouter);

app.get('*', function (req, res, next) {
    res.render("error")
});

app.set('port', port);
server.listen(port, function() {
    console.log('Starting server on port ' + port);
});

sockets.init(server);