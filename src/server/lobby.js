const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth');

const lobby = express.Router();
const tables = {};

lobby.use(bodyParser.text());

lobby.route('/getTables')
	.get(auth.userAuthentication, (req, res) => {
		res.json(tables);
	});

lobby.route('/createTable')
	.post(auth.userAuthentication, (req, res) => {
	   const body = JSON.parse(req.body);
       const userInfo =  auth.getUserInfo(req.session.id);

        for (tableID in tables) {
            const name = tables[tableID].tableName;
            if (name === body.tableName) {
                res.status(403).send('table name already exist');
                return;
            }
        }

       tables[body.tableName] = {game: null,creator: userInfo, tableName: body.tableName, users: [],stats: [], numberOfPlayers: 0, tableSize: body.tableSize, usingComputerPlayer: body.usingComputerPlayer};
       res.sendStatus(200);
	});

function getTableInfo(name) {
    return tables[name];
}

//lobby.appendUserLogoutMessage = function(userInfo) { }

module.exports = {
	tables: lobby,
    tableList: tables,
    getTableInfo
};