const PORT = 5000;

const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

// App setup.
const app = express();
app.use(express.static('../web'));

// Just in case, during a live demo~!
app.post('/api/KILL_THE_SERVER_', function (req, res) {
    process.exit(1);
});

// Polling server (todo idk)
app.post('/api/go', function (req, res) {
    // Update the schedule and push it out to all participants
    // 5seconds later than this time, to account for lag
    let start_time = Date.now() + (1000*5);
    all_users.forEach(socket => {
        // Create the schedule to send out
        socket.send(JSON.stringify(['schedule', {
            start: start_time,
            schedule: [],
        }]));
    });

    res.redirect('/operator/');
});

// Websocket setup.
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server,
    path: '/api/ws',
});

// Set of all users.
let all_users = new Set();
wss.on('connection', (ws, req) => {
    // Add to our set.
    all_users.add(ws);
    all_users.forEach(socket => {
        socket.send(JSON.stringify(['presence', all_users.size]));
    });
    console.log('(+) websocket subscribed, count is', all_users.size);
    
    // Remove from our set to our set.
    ws.on('close', () => {
        all_users.delete(ws);
        all_users.forEach(socket => {
            socket.send(JSON.stringify(['presence', all_users.size]));
        });
        console.log('(-) websocket unsubscribed, count is', all_users.size);
    });

    // Handle incoming messages
    ws.on('message', function incoming(message) {
        if (message == 'ping') {
            // drop pings
            return;
        }

        console.log('received message: %s', message);
        // TODO do something with this message?
    });
});

// Serve.
server.listen(PORT, () => {
    console.log('Listening on http://localhost:%d/', server.address().port);
});
