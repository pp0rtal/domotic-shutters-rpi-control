const express = require('express');

const config = require('./config');

const app = express();

app.get('/open/:id', () => {

});

app.get('/stop/:id', () => {

});

app.post('/close/:id', () => {

});

app.listen(config.server.port, () => {
  console.log(`server listening on ${config.server.port}`);
});
