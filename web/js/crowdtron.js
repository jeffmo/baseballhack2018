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
        case 'alert':
            alert(value);
            break;

        case 'presence':
            if (document.querySelector('#how_many')) {
                document.querySelector('#how_many').innerText = value;
            }
            break;
    }
}

// Websockets time out without content, so we add a setinterval
setInterval(() => {
    presence.send('ping');
}, 5000);
