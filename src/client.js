const Poetry = require( 'poetry' );
const Mqtt = require( 'mqtt' );

const SaveMeasurement = require( './saveMeasurement.js' );

// Mqtt client wraper
module.exports = function ( agent ) {
    var self = this;

    Poetry.log.info( 'Agent content' );

    self.setDatas = function ( agent ) {
        self.agentId = agent._id;
        self.agentName = agent.name;
        self.team = agent.team;
        self.host = agent.host;
        if ( Array.isArray( agent.topic ) )
            self.topic = agent.topic;
        else if ( agent.topic )
            self.topic = [ agent.topic ];
        self.type = agent.type;
        self.user = agent.user;
        self.pwd = agent.pwd;
        self.clientId = agent.clientId || 'iotFactorioMqtt' + Math.random()
            .toString( 16 )
            .substr( 2, 8 );

        if ( agent.port ) self.port = agent.port;
    };

    // Create and connect a mqtt client
    self.connect = function () {
        let settings = {
            host: self.host,
            topic: self.topic,
            clientId: self.clientId,
            keepalive: 10,
            reconnectPeriod: 10000,
            clean: true
        };

        if ( self.port ) settings.port = self.port;


        if ( self.user && self.pwd ) {
            settings.username = self.user;
            settings.password = self.pwd;
        }

        let client = Mqtt.connect( settings );

        // Subscribe to topic when connected
        client.on( 'connect', () => {
            Poetry.log.info(
                `Agent ${self.agentName} connected as ${self.clientId}`,
                self.topic
            );
            if ( self.topic.forEach )
                self.topic.forEach( topic => {
                    client.subscribe( topic, {
                        qos: 2
                    } );
                    Poetry.log.silly(
                        `Agent ${self.agentName} subscribed to ${topic}`
                    );
                } );
        } );

        // Saves the measurements when it receives
        client.on( 'message', ( topic, message ) => {
            Poetry.log.info( `Message received on ${self.agentName} (${topic}) : ${message}` );
            SaveMeasurement( self.type, topic, message, self.team );
        } );

        client.on( 'error', function ( err ) {
            Poetry.log.error( err );
        } );

        self.client = client;
    };

    // Stop the mqtt client
    self.stop = function () {
        Poetry.log.debug( "Agent " + self.agentName + " stopped" );
        if ( self.client ) {
            self.client.end();
        }
    };

    // Update the mqtt client
    self.update = function ( agent ) {
        self.stop();
        self.setDatas( agent );
        self.connect();
    };

    self.setDatas( agent );

};
