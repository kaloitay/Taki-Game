const express = require('express');
const auth = require('./auth');
//const lobby = require('./lobby');

const userManagement = express.Router();

userManagement.get('/', auth.userAuthentication, (req, res) => {
	const user = auth.getUserInfo(req.session.id);
    res.json(user);
});

userManagement.get('/getUsers', auth.userAuthentication, (req, res) => {
    res.json(auth.userList);
});

userManagement.post('/addUser', auth.addUserToAuthList, (req, res) => {		
	res.sendStatus(200);	
});

userManagement.get('/logout', [
	(req, res, next) => {
        for (sessionid in auth.userList) {
            const name = auth.userList[sessionid];
            if (name === req.body) {
                res.status(403).send('user name already exist');
                return;
            }
        }
        //lobby.appendUserLogoutMessage(userinfo);
		next();
	}, 
	auth.removeUserFromAuthList, 
	(req, res) => {
		res.sendStatus(200);		
	}]
);


module.exports = userManagement;