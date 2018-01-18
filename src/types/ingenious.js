import Poetry from 'poetry';

module.exports = class Ingenious {

	// Format datas received from mqtt to an IOT Factory measurement
	static format (topic, pmessage, team) {
		let message = JSON.parse(pmessage.toString('utf-8'));
		let measurement;

		Poetry.log.debug(`New ${message.topic} measurement for ${message.id}`);

		switch(message.topic) {
			case "bat":
				measurement = formatBattery(message);
				break;
			case "temp":
				measurement = formatTemp(message);
				break;
			case "pos":
				measurement = formatPosition(message);
				break;
			default:
				return null;
		}

		return {
			version: 1,
			device: {
				id: message.id.toString(),
				team: team,
				type: "ingenious",
				fromAgent: true
			},
			timestamp: new Date(message.time),
			measurements: measurement,
			network: {
				name: 'ingenious',
				protocol: 'mqtt'
			}
		};
	}
};

// Format the battery measure
function formatBattery(message) {
	return [
		{
			type: "batLevel",
			value: parseFloat(message.batLevel),
			timestamp: new Date(message.time)
		},
		{
			type: "battery",
			unit: "volt",
			value: parseFloat(message.volt),
			timestamp: new Date(message.time)
		}
	];
}

// Format the temperature measure
function formatTemp(message) {
	return [
		{
            "type": "temperature",
            "unit": "celsius",
            "value": parseFloat(message.temp),
			timestamp: new Date(message.time)
		}
	];
}

// Format the position measure
function formatPosition(message) {
	return [
		{
            "type": "position",
            "id": "gps",
            "value": {
                "lat": parseFloat(message.lat),
                "lng": parseFloat(message.lng)
            },
            "timestamp": new Date(message.gpsTime !== -1 ? message.gpsTime : message.time)
        }
	];
}
