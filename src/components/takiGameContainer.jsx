import React from "react";
import Board from "./board.jsx";

export default class TakiGameContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            tableInfo: ''
        };
        this.getGameInfo = this.getGameInfo.bind(this);
        this.foldTable = this.foldTable.bind(this);
    }

    componentDidMount() {
        this.getGameInfo();
    }

    // TODO: check it
    componentWillUnmount() {
        if (this.timeoutGameInfo) {
            clearTimeout(this.timeoutGameInfo);
        }
    }

    render() {
        if (!this.state.tableInfo.game) {
        let usersJSX = [];
        for (let userID in this.state.tableInfo.users) {
            const userName = this.state.tableInfo.users[userID].name;
            usersJSX.push(<p key={userName}>{userName}</p>);
        }
            return (
            <div id="waitingForPlayers">
                <h2><u>Waiting for players</u></h2>
                <div>
                    <u>Table name:</u> {this.state.tableInfo.tableName}
                </div>
                <div>
                    <u>Number of players:</u> {this.state.tableInfo.numberOfPlayers}/{this.state.tableInfo.tableSize}
                </div>
                <p></p>
                <u>Users</u>: {usersJSX}
                <input type="submit" className="btn" value="Fold" onClick={this.foldTable} id={this.state.tableInfo.tableName} />
            </div>
        )
    }
    else if (this.state.tableInfo.status == 'started') {
            return (<Board handleSuccessedQuitGame={this.props.handleSuccessedQuitGame} currentUser={this.props.currentUser} tableInfo={this.state.tableInfo}/>);
        }
        else {
            return null;
        }

    }

    foldTable(event) {
        event.preventDefault();
        this.handleFoldTable(this.state.tableInfo.tableName);
    }

    handleFoldTable(tableName) {
        fetch('/table/fold', {
            method: 'POST',
            body: tableName,
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok){
                    if (response.status === 403) {
                        this.setState(()=> ({errorMessage: "Cannot fold this table"}));
                    }
                }
                else {
                    //alert("you fold from the table");
                    this.props.foldHandler();
                }
            });
        //this.setState(()=> ({joinInProgress: false}));
        return false;
    }

    getGameInfo() {
        return fetch('/table', { method: 'POST', body: this.props.tableName, credentials: 'include'})
            .then((response) => {
                if (!response.ok){
                    throw response;
                }
                this.timeoutGameInfo = setTimeout(this.getGameInfo, 200);
                return response.json();
            })
            .then(tableInfo => {
                this.setState(()=>({tableInfo}));
            })
            .catch(err => {throw err});
    }
}