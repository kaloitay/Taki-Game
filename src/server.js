const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const userManagement = require('./server/userManagement');
const lobby = require('./server/lobby');
const gameManagement = require('./server/gameManagement');
const tableManagement = require('./server/tableManagement');

const auth = require('./server/auth');

const app = express();

app.use(session({ secret: 'keyboard cat', cookie: {maxAge:269999999999}}));
app.use(bodyParser.text());

app.use(express.static(path.join(__dirname, "..", "public")));

app.use('/users', userManagement);
app.use('/lobby', lobby.tables);
app.use('/table', tableManagement);
app.use('/game', gameManagement);

app.listen(3000, console.log('Taki game listening on port 3000!'));