import React from 'react';
import ReactDOM from 'react-dom';
import TablesArea from './tablesArea.jsx';
import TableCreation from './createTableInput.jsx';

export default class tablesContainer extends React.Component {
    render() {
        return (
            <div className="table-contaier">
                <TableCreation/>
                <TablesArea joinHandler={this.props.joinHandler} currentUser={this.props.currentUser}/>
            </div>
        )
    }
}