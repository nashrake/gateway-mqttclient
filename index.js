import Poetry from 'poetry';

import {
    Agents
} from 'poetry/models';

const ClientContainer = require('./src/clientsContainer.js');

function createClients() {
	Poetry.log.info('Start MQTT clients creation');

	// Create mqtt client for each mqtt agents
	Agents.find({'protocol': 'mqtt'})
		.then(agents => {
			for(let i in agents) {
				let agent = agents[i];
				
				if(agent.status == 'active') {
					ClientContainer.createClient(agent);
				}			
			}
		})
		.catch(Poetry.log.error);
}

// Wait a bit to create clients
setTimeout(createClients, 30 * 1000);

// Update the client when a mqtt agent is updated
Poetry.on( 'update:agents', {
	'protocol': 'mqtt'
}, agent => {
    if(agent.status == 'active') {
    	ClientContainer.updateClient(agent);
    } else {
    	ClientContainer.removeClient(agent._id);
    }
});

// Add a client when a mqtt agent is created
Poetry.on( 'insert:agents', {
	'protocol': 'mqtt'
}, agent => {
    if(agent.status == 'active') {
    	ClientContainer.createClient(agent);
    } else {
    	ClientContainer.removeClient(agent._id);
    }
});
