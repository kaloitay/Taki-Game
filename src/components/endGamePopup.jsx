import React from 'react';
import ReactDOM from 'react-dom';

export default class EndGamePopup extends React.Component {
    constructor(args) {
        super(args);
    }

    quitGame() {
        fetch('/game/quit', {method: 'POST', body: this.props.tableInfo.tableName, credentials: 'include'})
            .then(response => {
                if (!response.ok) {
                    throw response;
                }
                this.props.handleSuccessedQuitGame();
            })
        return false;
    }

    enterSpectatorMode() {
        fetch('/game/spectator', {
            method: 'POST',
            body: this.props.tableInfo.tableName,
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 403) {
                    }
                }
                else {
                    this.props.enterSpectatorModeHandler();
                }
            });
        return false;
    }


    render() {
        let playerID;
        for (let i = 0 ; i < this.props.tableInfo.tableSize; i++) {
            if (this.props.currentUser.name == this.props.tableInfo.users[i].name) {
                playerID = i;
                break;
            }
        }

        if (this.props.gameStatus === "ended" || this.props.playersStatus[playerID] == "won") {
            let x = new Date(this.props.gameStats.endGameTime).getTime();
            let y = new Date(this.props.gameStats.startGameTime).getTime();
            let timeSinceGameStarted = new Date(x-y);

            let playersStatsJSX = [];
            for (let playerID in this.props.playersStats) {
                const userStats = this.props.playersStats[playerID];
                let average = (userStats.turnsTimeSum / userStats.turnsAmount) / 1000;
                let averageToShow = (!(average > 0)) ? 0 : average.toFixed(3);
                playersStatsJSX.push(
                    <p key={playerID}>
                        {this.props.tableInfo.users[playerID].name} stats:<br></br>
                        User turns amount: {userStats.turnsAmount} <br></br>
                        Number of times the player has reached one card: {userStats.singleCardAmount}<br></br>
                        Average player step time: {averageToShow}
                        </p>
                );
            }
            let spectatorModeJSX = (this.props.gameStatus !== "ended") ? <div className="endGamePopupButton" onClick={this.enterSpectatorMode.bind(this)}>Keep watching</div> : null;
            let gameLengthJSX = (this.props.gameStatus === "ended") ? <p id="GameTimePopUp">Game length: {timeSinceGameStarted.getMinutes()} mins and {timeSinceGameStarted.getSeconds()} secs</p> : null;

            return (
                <div id="endGamePopup"
                     className="endGamePopup">
                    <div className="endGamePopup-content">
                        <div className="endGamePopup-header">
                            <h1 id="popUpTitle">{this.props.winnerList[0].name} won!</h1>
                        </div>
                        <div className="endGamePopup-body">
                            {gameLengthJSX}
                            {playersStatsJSX}
                            <div id="popupButtons">
                                <div className="endGamePopupButton" onClick={this.quitGame.bind(this)}>Quit</div>
                                {spectatorModeJSX}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        else
            return null;
    }
}