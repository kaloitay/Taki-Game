import React from 'react';
import ReactDOM from 'react-dom';

export default class Player extends React.Component {
    constructor(args) {
        super(args);

        this.state = {
            errorMessage: "",
            showCubeChangeColor: false,
            currentChangeColorCard: null
        }

        this.putCard = this.putCard.bind(this);
        this.onClickInfoImg = this.onClickInfoImg.bind(this);
    }

    renderPlayerCards() {
        if (this.props.cards && this.props.cards.length > 0) {
            let cardClass = this.props.cards[0].split("_")[0] + "_" + this.props.cards[0].split("_")[1] != "card_back" ? "card myCard" : "card";
                return (this.props.cards.map((card) => (
                        <img src={`/resources/Cards/${card.split("_")[0]}_${card.split("_")[1]}.png`}
                            className={`animated bounceInUp ${cardClass}`}
                            onClick={((event) => { this.handleOnClick(event) })}
                            onMouseOver={((event) => { this.handleMouseOverCard(event) })}
                            id = {card}
                            key={card}/>
                )));
        }
        return null;
    }

    renderPlayersStats() {
        if (this.props.stats) {
            let average = (this.props.stats.turnsTimeSum / this.props.stats.turnsAmount) / 1000;
            let averageToShow = (!(average > 0)) ? 0 : average.toFixed(3);
            return (
                <tbody>
                    <tr><td>Turns amount:</td><td> {this.props.stats.turnsAmount}</td></tr>
                    <tr><td>Single card amount:</td><td> {this.props.stats.singleCardAmount}</td></tr>
                        <tr><td>Average player step time:</td><td> {averageToShow} sec</td></tr>
                </tbody>
            )
        }
        return null;
    }

    handleOnClick(event) {
        let card = event.target.id;
        let splittedCard = card.split("_");

        if (splittedCard[1] === "colorChanger" && splittedCard[0] === "colorless") {
            this.setState(()=>({showCubeChangeColor: true,currentChangeColorCard: card}));
        }
        else
            this.putCard(card);
    }

    putCard(card) {
        const reqText = {
            tableName: this.props.tableInfo.tableName,
            card: card
        }
        this.setState(() => ({showCubeChangeColor: false,currentChangeColorCard: null}));

        fetch('/game/putCard', {
            method: 'POST',
            body: JSON.stringify(reqText),
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 403) {
                        this.setState(()=> ({errorMessage: "Cannot put this card"}));
                    }
                }
                else {
                    this.setState(()=> ({errorMessage: ""}));
                    this.props.putCardHandler();
                }
            });
        //this.setState(()=> ({joinInProgress: false}));
        return false;
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

    handleMouseOverCard(event) {
        let cardClass = event.target.id.split("_")[0] + "_" + event.target.id.split("_")[1] != "card_back" ? "mycard card" : "card";
        event.target.className = cardClass;
    }

    onClickInfoImg(event) {
        var popup = document.getElementById("statsPopup_" + event.target.id);
        popup.classList.toggle("show");
    }

    render() {
        let idMyTurn = (this.props.tableInfo.users[this.props.id].name == this.props.userTurn) ? "myTurn" : "";

        return (
            <div id={`player_${this.props.id+1}`} className="player" >
                <div id={idMyTurn}>
                        {this.props.tableInfo.users[this.props.id].name}
                        <img className="infoPic" id={this.props.id+1} src="resources\Other\info.png" onClick={(event) => this.onClickInfoImg(event)} />
                    </div>
                    <div className="popup">
                        <span className="popuptext" id={`statsPopup_${this.props.id+1}`}>
                            <table>{this.renderPlayersStats()}</table>
                        </span>
                    </div>
                <div className="playerCards"> {this.renderPlayerCards()} </div>
                {this.renderErrorMessage()}
                <ChangeColor putCardFunction={this.putCard} showCubeChangeColor={this.state.showCubeChangeColor} currentChangeColorCard={this.state.currentChangeColorCard} />
            </div>
        );
    }
}

class ChangeColor extends React.Component {
    constructor(args) {
        super(args);
    }

    render() {
        if (this.props.showCubeChangeColor) {
            let splittedCard = this.props.currentChangeColorCard.split("_");
            let typeWithId = "_" + splittedCard[1] + "_" + splittedCard[2];
            return (
                <div id="change_color">
                    <img id="red_cube" src="resources\Other\red_cube.png" onClick={(event) => {
                        this.props.putCardFunction('red' + typeWithId);
                    }}/>
                    <img id="blue_cube" src="resources\Other\blue_cube.png" onClick={() => {
                        this.props.putCardFunction('blue' + typeWithId);
                    }}/>
                    <img id="yellow_cube" src="resources\Other\yellow_cube.png" onClick={() => {
                        this.props.putCardFunction('yellow' + typeWithId);
                    }}/>
                    <img id="green_cube" src="resources\Other\green_cube.png" onClick={() => {
                        this.props.putCardFunction('green' + typeWithId);
                    }}/>
                </div>
            );
        }
        else
            return null;
    }
}