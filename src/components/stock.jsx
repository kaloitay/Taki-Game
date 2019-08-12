import React from 'react';
import ReactDOM from 'react-dom';

export default class Stock extends React.Component {
    constructor(args) {
        super(args);
        this.state = {
            errorMessage: ""
        }
    }

    renderErrorMessage() {
        if (this.state.errorMessage) {
            return (
                <div className="login-error-message">
                    {this.state.errorMessage}
                </div>
            );
        }
        return null;
    }

    render() {
        return (
            <div id="stock">
                <OpenDeck cards={this.props.openDeckCards} tableInfo={this.props.tableInfo} />
                <FoldDeck cardsAmount={this.props.foldDeckCardsAmount} tableInfo={this.props.tableInfo} takeCardHandler={this.props.takeCardHandler} />
                {this.renderErrorMessage()}
            </div>
        );
    }
}

class OpenDeck extends React.Component {
    constructor(args) {
        super(args);
    }

    render() {
        if (this.props.cards.length > 0) {
            return (
                <div id="openDeck">
                    <img id="lastOpenCard" className="img card" src = {`/resources/Cards/${this.props.cards[this.props.cards.length - 1].color}_${this.props.cards[this.props.cards.length - 1].sign}.png`} />
                </div>
            );
        }
        else
            return (<div id="OpenDeck"/>);
    }
}

class FoldDeck extends React.Component {
    constructor(args) {
        super(args);
    }

    foldDeckCardStyle(i) {
        let foldDeckCardStyle = {
            position: `absolute`,
            top: `${0.15 * i}px`,
            right: `${0.15 * i}px`
        };
        return foldDeckCardStyle;
    }

    handleClick() {
        fetch('/game/takeCard', {method: 'POST', body: this.props.tableInfo.tableName, credentials: 'include'})
            .then(response => {
                if (!response.ok) {
                    this.setState(()=>({errorMessage: "Cannot take card"}));
                }
                else {
                    this.props.takeCardHandler();
                    //this.setState(() => ({errorMessage: ""}));
                }
            });
        return false;
    }

    handleMouseLeave() {
    }

    renderTheFoldDeck() {
        let foldDeckJSX = [];
        for (let cardID = 0 ; cardID < this.props.cardsAmount ; cardID++) {
            foldDeckJSX.push(
                <img src = {'/resources/Other/card_back.png'}
                     className="img card"
                     style={this.foldDeckCardStyle(cardID)}
                     key = {`foldDeckCard_${cardID}`}
                     onClick= {this.handleClick.bind(this)}
                     onMouseLeave={this.handleMouseLeave}
                />
            );
        }
        return foldDeckJSX;
    }

    render() {
        return (
            <div id="foldDeck">
                <div id="FoldDeckCards">
                    {this.renderTheFoldDeck()}
                </div>
            </div>
        );
    }
}

class GameStats extends React.Component {
    constructor(args) {
        super(args);
    }

    render() {
        return (
            <div>
                <div id="GameStatistics">
                    <div id="TurnIndicate">Turn: {(game.userTurn ? "User" : "Computer")}</div>
                    <div id="OpenDeckAmount">Open deck cards amount: {game.openDeck.length}</div>
                    <div id="FoldDeckAmount">Fold deck cards amount: {game.foldDeck.length}</div>
                    <div id="ComputerTurnsAmount">Computer turns amount: {game.stats.computerTurnsAmount}</div>
                    <div id="UserTurnsAmount">User turns amount: {game.stats.userTurnsAmount}</div>
                </div>
            </div>
        );
    }
}