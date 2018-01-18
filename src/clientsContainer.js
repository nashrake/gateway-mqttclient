const Client = require('./client.js');

var CLIENTS = {};

// Containers for mqtt clients
var ClientContainer = {};

// Create a mqtt client in the container
ClientContainer.createClient = function(agent) {
	CLIENTS[agent._id] = new Client(agent);
	CLIENTS[agent._id].connect();
};

// Update a mqtt client in the container
ClientContainer.updateClient = function(agent) {
	if(CLIENTS[agent._id]) {
		CLIENTS[agent._id].update(agent);
	} else {
		ClientContainer.createClient(agent);
	}
};

// Remove a mqtt client from the container
ClientContainer.removeClient = function(id) {
	if(CLIENTS[id]) {
		CLIENTS[id].stop();
		CLIENTS[id] = undefined;
	}
};

module.exports = ClientContainer;