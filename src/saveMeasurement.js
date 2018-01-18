const Fs = require( 'fs' );
const Path = require( 'path' );

import Poetry from 'poetry';

import {
    Measurements
} from 'poetry/models';

var Types = {};

// Load parsers
Fs.readdirSync( "./src/types" )
    .filter( file => {
        return Fs.statSync( Path.join( "./src/types", file ) )
            .isFile();
    } )
    .forEach( file => {
        Types[ Path.basename( "./src/types/" + file, '.js' ) ] = require( "./types/" + file );
    } );

// Use the specified parser to format datas
module.exports = function ( type, topic, message, team ) {
    let measurement = Types[ type ].format( topic, message, team );

    if ( !measurement ) return;

    Measurements.update( {
            'device.id': measurement.device.id,
            'timestamp': {
                $lte: new Date( measurement.timestamp.getTime() + 500 ),
                $gte: new Date( measurement.timestamp.getTime() - 500 )
            }
        }, {
            $setOnInsert: {
                timestamp: measurement.timestamp,
                device: measurement.device
            },
            $addToSet: {
                measurements: {
                    $each: measurement.measurements
                }
            }
        }, {
            upsert: true
        } )
        .then( r => {
            Poetry.log.silly( r );
            Poetry.emit( 'update:soapmeasurement', r );
        } )
        .catch( Poetry.log.error );

};
