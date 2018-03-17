const express = require('express');

const app = express();

app.use(express.static('../web'))

app.get('/api/poll', function (req, res) {
    console.log('hey buddy')
    res.send('Hello World');
});
 
app.listen(3000);
