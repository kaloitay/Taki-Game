const express = require('express');
const auth = require('./auth');
const tables = require('./lobby');
const gameLogic = require('./gameLogic');

const tableManagement = express.Router();

tableManagement.post('/', auth.userAuthentication, (req, res) => {
    const table = tables.getTableInfo(req.body);
    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else
    {
        res.json(table);
    }
});

tableManagement.post('/join', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);

    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else if (table.numberOfPlayers >= table.tableSize) {
        res.status(403).send('The table is full');
    }
    else
    {
        for (userID in table.users) {
            const name = table.users[userID];
            if (name === requestedUser.name) {
                res.status(403).send('user name already in the table');
                return;
            }
        }
        table.users.push(requestedUser);
        requestedUser.isInGame = true;
        requestedUser.tableName = table.tableName;
        table.numberOfPlayers++;

        if (table.numberOfPlayers + 1 == table.tableSize && table.usingComputerPlayer) {
            table.users.push({name: "Computer", isInGame: true, tableName: table.tableName, type: "computer"});
            table.numberOfPlayers++;
        }

        if (table.numberOfPlayers == table.tableSize) {
            table.status = 'started';
            table.game = new gameLogic.game(table.tableSize, table.usingComputerPlayer, table);
            table.game.startGameTime = new Date();
        }
        res.sendStatus(200);
    }
});

tableManagement.post('/delete', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);

    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else if (table.numberOfPlayers > 0) {
        res.status(403).send('The table not empty');
    }
    else {
        if (table.creator.name  != requestedUser.name) {
            res.status(403).send('You are not the creator of this table');
            return;
        }
        delete tables.tableList[table.tableName];
        res.sendStatus(200);
    }
});

tableManagement.post('/fold', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);

    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else
    {
        let isInTable = false;
        for (userID in table.users) {
            const name = table.users[userID].name;
            if (name === requestedUser.name) {
                isInTable = true;
                break;
            }
        }
        if (!isInTable) {
            res.status(403).send('User not found in this table');
        }
        else
        {
            table.users.splice(userID,1);
            table.numberOfPlayers--;
            requestedUser.isInGame = false;
            requestedUser.tableName = '';
            res.sendStatus(200);

        }
    }
});


module.exports = tableManagement;