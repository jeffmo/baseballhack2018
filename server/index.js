const PORT = 5000;

const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();

app.use(express.static('../web'));

app.get('/api/poll', function (req, res) {
    console.log('hey buddy')
    res.send('Hello World');
});

app.post('/api/KILL_THE_SERVER_', function (req, res) {
    process.exit(1);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
    server,
    path: '/api/ws',
});

let user_count = 0;

wss.on('connection', function connection(ws, req) {
    const location = url.parse(req.url, true);
    // You might use location.query.access_token to authenticate or share sessions
    // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    user_count += 1;
    console.log('(+) websocket subscribed, count is', user_count);

    ws.on('message', function incoming(message) {
        if (message == 'ping') {
            // drop pings
            return;
        }

        console.log('received message: %s', message);
        // TODO do something with this?
    });

    // ws.send('something');

    console.log('counter++');
    ws.on('close', function () {
        user_count = (user_count > 0 ? user_count - 1 : 0);
        console.log('(-) websocket unsubscribed, count is', user_count);
    })
});

server.listen(PORT, function listening() {
    console.log('Listening on http://localhost:%d/', server.address().port);
});