import React from 'react';
import ReactDOM from 'react-dom';
import LoginModal from './login-modal.jsx';
import TablesContaier from './tablesContainer.jsx';
import TakiGameContaier from './takiGameContainer.jsx'

export default class BaseContainer extends React.Component {
    constructor(args) {
        super(...args);
        this.state = {
            isLoggedIn: false,
            currentUser: {
                name: '',
                isInGame: false,
                tableName: '',
                type: "human"
            }
        };

        this.handleSuccessedLogin = this.handleSuccessedLogin.bind(this);
        this.handleSuccessedJoin = this.handleSuccessedJoin.bind(this);
        this.handleSuccessedQuitGame = this.handleSuccessedQuitGame.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);
        this.foldHandler = this.foldHandler.bind(this);
        this.getUserName = this.getUserName.bind(this);

        this.getUserName();
    }

    render() {
        if (!this.state.isLoggedIn) {
            return (<LoginModal loginSuccessHandler={this.handleSuccessedLogin} loginErrorHandler={this.handleLoginError}/>);
        }
        if (!this.state.currentUser.isInGame) {
            return this.renderAllTables();
        }
        return (<TakiGameContaier handleSuccessedQuitGame={this.handleSuccessedQuitGame} currentUser={this.state.currentUser} foldHandler={this.foldHandler} tableName={this.state.currentUser.tableName}/>);
    }

    handleSuccessedQuitGame(tableName) {
        this.setState(() => ({isLoggedIn: true}), this.getUserName);
    }

    handleSuccessedJoin(tableName) {
        this.setState(() => ({isLoggedIn: true}), this.getUserName);
    }

    handleSuccessedLogin() {
        this.setState(() => ({isLoggedIn:true}), this.getUserName);
    }

    // TODO: check if need to update currentUser state
    handleLoginError() {
        console.error('login failed');
        this.setState(() => ({isLoggedIn:false}));
    }

    // TODO:
    foldHandler() {
        this.setState(()=>({isLoggedIn:true}),this.getUserName);
    }

    renderAllTables() {
        return(
            <div className="table-base-container">
                <div className="user-info-area">
                    Hello {this.state.currentUser.name}
                    <button className="logout btn" onClick={this.logoutHandler}>Logout</button>
                </div>
                <TablesContaier joinHandler={this.handleSuccessedJoin} currentUser={this.state.currentUser}/>
            </div>
        )
    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(()=>({currentUser: userInfo, isLoggedIn: true}));
        })
        .catch(err => {
            if (err.status === 401) { // incase we're getting 'unautorithed' as response
                this.setState(()=>({isLoggedIn: false}));
            } else {
                throw err; // in case we're getting an error
            }
        });
    }

    fetchUserInfo() {
        return fetch('/users',{method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok){
                throw response;
            }
            return response.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                console.log(`failed to logout user ${this.state.currentUser.name} `, response);
            }
            this.setState(()=>({currentUser: {name:'', isInGame: false, tableName: ''}, isLoggedIn: false}));
        })
    }
}