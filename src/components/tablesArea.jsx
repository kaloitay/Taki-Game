import React from 'react';
import ReactDOM from 'react-dom';

export default class TablesArea extends React.Component {
    constructor(args) {
        super(...args);

        this.state = {
            errorMessage: "",
            joinInProgress: false,
            deleteInProgress: false,
            users: [],
            tables: []
        };

        this.getUsers = this.getUsers.bind(this);
        this.getTables = this.getTables.bind(this);
        this.joinTable = this.joinTable.bind(this);
        this.deleteTable = this.deleteTable.bind(this);
    }

    componentDidMount() {
        this.getUsers();
        this.getTables();
    }

    // TODO: check it
    componentWillUnmount() {
        if (this.timeoutUsers) {
            clearTimeout(this.timeoutUsers);
        }
        if (this.timeoutTables)
            clearTimeout(this.timeoutTables);
    }

    render() {
        let usersJSX = [];
        for (let sessionid in this.state.Users) {
            const userName = this.state.Users[sessionid].name;
            usersJSX.push(<p key={userName}>{userName}</p>);
        }

        let tablesJSX =[];
        for (let tableName in this.state.tables) {
            const table = this.state.tables[tableName];
            const disableJoin = this.state.joinInProgress || table.numberOfPlayers == table.tableSize;
            const disableDelete = this.state.deleteInProgress || table.numberOfPlayers > 0 || this.props.currentUser.name != table.creator.name;
            const tableStatus = table.game ? "started" : "not started";
            tablesJSX.push(
                <tr key={table.tableName}>
                    <td>{table.tableName}</td>
                    <td>{table.creator.name}</td>
                    <td>{table.numberOfPlayers}/{table.tableSize}</td>
                    <td>{(table.usingComputerPlayer) ? 1 : 0}</td>
                    <td>{tableStatus}</td>
                    <td>
                        <input type="submit" className="btn" value="Join" onClick={this.joinTable} id={table.tableName} disabled={disableJoin} />
                        <input type="submit" className="btn" value="Delete" onClick={this.deleteTable} id={table.tableName} disabled={disableDelete} />
                    </td>
                </tr>
            );
        }

        return(
            <div className="converssion-area-wrpper">
                <div id="users">
                <h2>Online users ({usersJSX.length})</h2>
                {usersJSX}
                </div>
                <div id="tables">
                <h2>Tables ({tablesJSX.length})</h2>
                    <table id="tableTables">
                        <tbody>
                    <tr>
                        <th>Table name</th>
                        <th>Creator</th>
                        <th>Players</th>
                        <th>Computer players</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                {tablesJSX}
                        </tbody>
                    </table>
                </div>
                {this.renderErrorMessage()}
            </div>
        )
    }

    deleteTable(event) {
        event.preventDefault();
        this.setState(()=>({deleteInProgress:true}));
        this.handleDeleteTable(event.target.id);
    }

    handleDeleteTable(tableName) {
        fetch('/table/delete', {
            method: 'POST',
            body: tableName,
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok){
                    if (response.status === 403) {
                        this.setState(()=> ({errorMessage: "Cannot delete this table"}));
                    }
                }
                else {
                    this.setState(()=> ({errorMessage: ""}));
                    this.getTables();
                }
            });
        this.setState(()=> ({deleteInProgress: false}));
        return false;
    }

    joinTable(event) {
        event.preventDefault();
        this.setState(()=>({joinInProgress:true}));
        this.handleJoinTable(event.target.id);
    }

    handleJoinTable(tableName) {
        fetch('/table/join', {
            method: 'POST',
            body: tableName,
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok){
                    if (response.status === 403) {
                        this.setState(()=> ({errorMessage: "Cannot join this table"}));
                    }
                }
                else {
                    this.setState(()=> ({errorMessage: ""}));
                    this.props.joinHandler(tableName);
                }
            });
        this.setState(()=> ({joinInProgress: false}));
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

    getUsers() {
        return fetch('/users/getUsers', {method: 'GET', credentials: 'include'})
            .then((response) => {
                if (!response.ok){
                    throw response;
                }
                this.timeoutUsers = setTimeout(this.getUsers, 200);
                return response.json();
            })
            .then(Users => {
                this.setState(()=>({Users}));
            })
            .catch(err => {throw err});
    }

    getTables() {
        return fetch('/lobby/getTables', {method: 'GET', credentials: 'include'})
            .then((response) => {
                if (!response.ok){
                    throw response;
                }
                this.timeoutTables = setTimeout(this.getTables, 200);
                return response.json();
            })
            .then(tables => {
                this.setState(()=>({tables}));
            })
            .catch(err => {throw err});
    }
}