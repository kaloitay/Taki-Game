import React from 'react';
import ReactDOM from 'react-dom';

export default class CreateTableInput extends React.Component {
    constructor(args) {
        super(...args);

        this.state = {
            errorMessage: "",
            createInProgress: false,
            selectedOption: '2',
            usingComputerPlayer: false
        };

        this.createTable = this.createTable.bind(this);
        this.handleOptionChange = this.handleOptionChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    render() {
        return(
            <form id="tableCreation" className="table-input-wrapper" onSubmit={this.createTable}>
                <input type="text" maxLength="25" disabled={this.state.createInProgress} placeholder="Enter table name here" ref={input => this.inputElement = input} />

                <input type="submit" className="btn" disabled={this.state.createInProgress} value="Create" />
                {this.renderErrorMessage()}
                <div id="tableSizeOptions">
                    Table size:
                    <div className="radio">
                        <input type="radio" value="2"
                               checked={this.state.selectedOption === '2'}
                               onChange={this.handleOptionChange} />
                        2
                    </div>
                    <div className="radio">
                        <input type="radio" value="3"
                               checked={this.state.selectedOption === '3'}
                               onChange={this.handleOptionChange} />
                        3
                    </div>
                    <div className="radio">
                        <input type="radio" value="4"
                               checked={this.state.selectedOption === '4'}
                               onChange={this.handleOptionChange} />
                        4
                    </div>
                </div>
                <input
                    name="usingComputerPlayer"
                    type="checkbox"
                    checked={this.state.usingComputerPlayer}
                    onChange={this.handleInputChange} />
                Use computer player
            </form>
    )}


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

    handleOptionChange (changeEvent) {
        this.setState({
            selectedOption: changeEvent.target.value
        });
    }

    createTable(event) {
        event.preventDefault();

        this.setState(()=>({createInProgress: true}));
        const reqText = {
            tableName: this.inputElement.value,
            tableSize: this.state.selectedOption,
            usingComputerPlayer: this.state.usingComputerPlayer
        }

        // TODO: check if dataType is needed and if we can remove JSON.stringfy ...

        fetch('/lobby/createTable', {
            method: 'POST',
            dataType: 'json',
            body: JSON.stringify(reqText),
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                this.setState(()=>({errorMessage: "Cannot create this table",createInProgress: false}));
                throw response;
            }
            this.state.usingComputerPlayer = false;
            this.inputElement.value = '';
            this.setState(()=>({createInProgress: false, errorMessage: ""}));
        });
        return false;
    }
}