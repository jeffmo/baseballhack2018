const PORT = 5000;

const express = require('express');
const fs = require('fs');
const http = require('http');
const path = require('path');
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
    const COUNTDOWN_SECS = 5;
	const MS_IN_SEC = 1000;
    const startCountdownTime = Date.now() + (COUNTDOWN_SECS*MS_IN_SEC);

    Object.values(sections).forEach(section_users => {
        section_users.forEach(socket => {
            // Create the schedule to send out
            socket.send(JSON.stringify(['schedule', {
                start: startCountdownTime,
                // schedule: colorsList,
            }]));
        });
    });

    res.redirect('/operator/');
});

let START = Date.now();

const VIDEO_FILE = path.resolve(__dirname, 'video.mp4');
app.get('/video.mp4', function (req, res) {
  var range = req.headers.range;
  if (!range) {
    return res.sendStatus(416); // Wrong range
  }

  console.log('statting...');
  fs.stat(VIDEO_FILE, function(err, stats) {
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    var total = stats.size;
    var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    var chunksize = (end - start) + 1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4"
    });

    function doStream() {
      console.log('reading stream...');
      var stream = fs.createReadStream(VIDEO_FILE, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        })
        .on("error", function(err) {
          res.end(err);
        });
    }
    setTimeout(doStream, 5000);
    /*
    setTimeout(function waiter() {
      const diff = Date.now() - START;
      console.log('diff: ', diff);
      if (Date.now() - START < (1000* 20)) {
        setTimeout(waiter, 5000);
      } else {
        START = Date.now();
        doStream();
      }
    }, 5000);
    */
  });
});

// Websocket setup.
const server = http.createServer(app);
const wss = new WebSocket.Server({
    server,
    path: '/api/ws',
});

// Set of all users.
let sections = {
    '1': new Set(),
    '2': new Set(),
    '3': new Set(),
    '4': new Set(),
};
let operators = new Set();
wss.on('connection', (ws, req) => {
    // Validate section
    console.log('ws connected with protocol:', ws.protocol);
    let section = ws.protocol in sections ? ws.protocol : 'operator';

    // Add to our set.
    if (section !== 'operator') {
        sections[section].add(ws);
    } else {
        operators.add(ws);
    }
    operators.forEach(socket => {
        socket.send(JSON.stringify(['presence', Object.values(sections).map(s => s.size)]));
    });
    console.log('(+) websocket subscribed, section counts:', Object.values(sections).map(s => s.size));
    // Remove from our set to our set.
    ws.on('close', () => {
        if (section !== 'operator') {
            sections[section].delete(ws);
        } else {
            operators.delete(ws);
        }
        operators.forEach(socket => {
            socket.send(JSON.stringify(['presence', Object.values(sections).map(s => s.size)]));
        });
        console.log('(-) websocket unsubscribed, section counts:', Object.values(sections).map(s => s.size));
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
