import React from 'react';
import ReactDOM from 'react-dom';
import Player from './player.jsx';
import Stock from './stock.jsx';
import EndGamePopup from './EndGamePopup.jsx';

export default class Board extends React.Component {
    constructor(args) {
        super(args);

        this.state = {
            errorMessage: "",
            playerTurn: null,
            gameStatus: null,
            winnerList: [],
            playersCards: [],
            playersStatus: [],
            playersStats: [],
            openDeckCards: [],
            foldDeckCardsAmount: 0,
            gameStats: []
        }
        this.putCardHandler = this.putCardHandler.bind(this);
        this.takeCardHandler = this.takeCardHandler.bind(this);
        this.putCardHandler = this.putCardHandler.bind(this);
        this.gameUpdate = this.gameUpdate.bind(this);
        this.getStatus = this.getStatus.bind(this);
        this.enterSpectatorModeHandler = this.enterSpectatorModeHandler.bind(this);

        this.gameUpdate();
    }

    gameUpdate() {
        this.getStatus();
    }

    componentDidMount() {
        this.gameUpdate();
    }

    enterSpectatorModeHandler() {
        this.gameUpdate();
    }

    componentWillUnmount() {
        if (this.timeoutGetStatus)
            clearTimeout(this.timeoutGetStatus);
    }

    takeCardHandler() {
        this.gameUpdate();
    }

    putCardHandler() {
        this.gameUpdate();
    }

    getStatus() {
        fetch('/game/getStatus', {method: 'POST', body: this.props.tableInfo.tableName, credentials: 'include'})
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(response => {
                this.state.gameStatus = response.gameInfo.gameStatus;
                this.state.playerTurn = response.gameInfo.playerTurn;
                this.state.winnerList = response.gameInfo.winnerList;

                this.state.openDeckCards = response.stock.openCard;
                this.state.foldDeckCardsAmount = response.stock.foldDeckCardsAmount;

                for (let i = 0 ; i < this.props.tableInfo.tableSize; i++)
                    this.state.playersCards[i] = response.playersCards[i];

                for (let i = 0 ; i < this.props.tableInfo.tableSize; i++)
                    this.state.playersStatus[i] = response.playersStatus[i];

                for (let i = 0 ; i < this.props.tableInfo.tableSize; i++)
                    this.state.playersStats[i] = response.playersStats[i];

                this.state.gameStats = response.gameStats;

                this.timeoutGetStatus = setTimeout(this.getStatus, 200);
                this.setState(()=>({errorMessage: ""}));
            })
        return false;
    }

    render() {
        let playersJSX = [];
        let userTurn = (this.state.playerTurn != null) ? (this.props.tableInfo.users[this.state.playerTurn].name) : (null);
        for (let playerID = 0 ; playerID < this.props.tableInfo.tableSize ; playerID++) {
            const userName = this.props.tableInfo.users[playerID];
            playersJSX.push(<Player id={playerID} userTurn={userTurn} key={playerID} tableInfo={this.props.tableInfo} stats={this.state.playersStats[playerID]} type={userName.type} cards={this.state.playersCards[playerID]} putCardHandler={this.putCardHandler} />);
        }
        return (
            <div id="Game">
                <EndGamePopup handleSuccessedQuitGame={this.props.handleSuccessedQuitGame} enterSpectatorModeHandler={this.enterSpectatorModeHandler} currentUser={this.props.currentUser} tableInfo={this.props.tableInfo} gameStatus={this.state.gameStatus} winnerList={this.state.winnerList} gameStats={this.state.gameStats} playersStatus={this.state.playersStatus} playersStats={this.state.playersStats}/>
                {playersJSX}
                <Stock foldDeckCardsAmount={this.state.foldDeckCardsAmount} openDeckCards={this.state.openDeckCards} tableInfo={this.props.tableInfo} takeCardHandler={this.takeCardHandler} />
            </div>
        );
    }
}