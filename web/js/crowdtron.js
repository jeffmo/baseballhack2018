var presence = new WebSocket(
    (window.location.protocol.match(/^https/) ? 'wss://' : 'ws://') +
        window.location.host + '/api/ws',
);

presence.onopen = function (event) {
//   exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
    console.log('opened');
};

presence.onmessage = function (event) {
    let packet = JSON.parse(event.data);
    let key = packet[0];
    let value = packet[1];

    switch (key) {
        case 'schedule':
            // value.start is the UTC start time to compare with (new Date()).getTime()
            // value.schedule is a bundle of schedule data we can use arbitrarily

            // TODO don't just alert this
            // alert(value.start);
            if (window.colorShow) {
                colorShow(value.start, value.schedule);
            }
            break;

        case 'presence':
            if (document.querySelector('#how_many')) {
                // Don't include self, so subtract 1
                document.querySelector('#how_many').innerText = value - 1;
            }
            break;
    }
}

// Websockets time out without content, so we add a setinterval
setInterval(() => {
    presence.send('ping');
}, 5000);
