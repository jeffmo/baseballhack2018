const express = require('express');

const app = express();

app.use(express.static('../web'))

app.get('/api/poll', function (req, res) {
    console.log('hey buddy')
    res.send('Hello World');
});
 
let PORT = 5000;
app.listen(PORT);
console.log('Launched on port http://0.0.0.0:' + PORT + '/');
