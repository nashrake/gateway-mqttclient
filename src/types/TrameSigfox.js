import Poetry from 'poetry';

const UNIT = {
    tempcorr: '°C',
    humidite: '‰HR',
    humiditycorr: '%HR',
    co2: 'ppm',
    part: 'µg/m3'
};


module.exports = class TrameSigfox {

    // Format datas received from mqtt to an IOT Factory measurement
    static format( topic, message, team ) {

        topic = topic.split( '/' );

        let value = message.toString( 'utf-8' ),
            measurements = [];

        if ( value.startsWith( '{' ) || value.startsWith( '[' ) )
            try {
                value = JSON.parse( value );
                Object.keys( value )
                    .forEach( type => {
                        let m = {
                            type: type,
                            value: value[ type ]
                        };

                        let unit = getUnit( topic[ 1 ] );
                        if ( unit ) m.unit = unit;

                        measurements.push( m );
                    } );
            } catch ( e ) {}

        if ( !measurements.length ) {

            if ( value == parseFloat( value ) )
                value = parseFloat( value );

            measurements = [ {
                type: topic[ 1 ],
                value: value
            } ];

            let unit = getUnit( topic[ 1 ] );
            if ( unit ) measurements[ 0 ].unit = unit;

        }

        return {
            version: 1,
            device: {
                id: topic[ 0 ],
                team: team,
                type: "raw",
                fromAgent: true
            },
            timestamp: new Date(),
            measurements: measurements,
            network: {
                name: 'TrameSigfox',
                protocol: 'mqtt'
            }
        };
    }
};

function getUnit( type ) {
    let unit;

    type = type.toLowerCase();

    Object.keys( UNIT )
        .some( t => {
            if ( !type.startsWith( t ) ) return;

            unit = UNIT[ t ];
            return true;
        } );

    return unit;
}
