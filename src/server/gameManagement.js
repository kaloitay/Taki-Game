const express = require('express');
const bodyParser = require('body-parser');
const auth = require('./auth');
const gameLogic = require('./gameLogic');
const tables = require('./lobby');

const gameManagement = express.Router();
gameManagement.use(bodyParser.text());


gameManagement.post('/getStatus', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);
    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else
    {
        let userTableID = getUserIndex(table, requestedUser.name);
        let gameInfo = {gameStatus: table.game.gameStatus, winnerList: table.game.winnerList, playerTurn: table.game.playerTurn}
        let playersCards = table.game.getPlayersCards(userTableID);
        let stock = {openCard: table.game.openDeck, foldDeckCardsAmount: table.game.foldDeck.length};
        let gameStats = {startGameTime: table.game.startGameTime, endGameTime: table.game.endGameTime};
        let playersStats = table.game.getPlayersStats();
        let playersStatus = table.game.getPlayersStatus();

        res.json({gameInfo: gameInfo, playersCards: playersCards,stock: stock,gameStats: gameStats, playersStatus: playersStatus, playersStats: playersStats});
    }
});

gameManagement.post('/spectator', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);
    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else {
        let userTableID = getUserIndex(table, requestedUser.name);
        table.game.players[userTableID].status = "spectator";
        res.sendStatus(200);
    }
});

gameManagement.post('/quit', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);
    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else {
        let userTableID = getUserIndex(table, requestedUser.name);
        let isAllPlayersQuit = table.game.quitGame(userTableID);
        auth.userList[req.session.id].isInGame = false;
        auth.userList[req.session.id].tableName = "";
        if (isAllPlayersQuit)
            delete tables.tableList[table.tableName];

        res.sendStatus(200);
    }
});


gameManagement.post('/takeCard', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const table = tables.getTableInfo(req.body);

    if (table === undefined)
        res.status(403).send('The table not found');
    else {
        let userTableID = getUserIndex(table, requestedUser.name);

        if (userTableID != table.game.playerTurn) {
            res.status(403).send('Its not your turn');
        }
        else if (table.game.isPlayerHaveCardToSet(table.game.players[userTableID])) {
            res.status(403).send('You have card to set');
        }
        else {
            table.game.takeCards(table.game.players[userTableID]);
            res.sendStatus(200);
        }
    }
});

gameManagement.post('/putCard', auth.userAuthentication, (req, res) => {
    const requestedUser = auth.getUserInfo(req.session.id);
    const body = JSON.parse(req.body);
    const table = tables.getTableInfo(body.tableName);

    if (table === undefined) {
        res.status(403).send('The table not found');
    }
    else {
        let userTableID = getUserIndex(table, requestedUser.name);
        let userPlayerClass = table.game.players[userTableID];
        let chosenCard = table.game.getCardClassByString(userPlayerClass, body.card);
        let chosenColor = body.card.split("_")[0];

        if (userTableID != table.game.playerTurn) {
            res.status(403).send('Its not your turn');
        }
        else if (chosenCard && table.game.isValidStep(chosenCard) ) {
            table.game.executeStep(userPlayerClass, chosenCard, chosenColor);
            res.sendStatus(200);
        }
        else
            res.status(403).send('You cant put this card');
    }
});


function getUserIndex(table, requestedUser) {
    let userTableID, user;
    for (id in table.users) {
        user = table.users[id];
        if (requestedUser === user.name) {
            userTableID = id;
            break;
        }
    }

    return userTableID;
}

module.exports = gameManagement;