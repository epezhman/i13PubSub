'use strict';

module.exports.register = register;
module.exports.getMessages = getMessages;

const Client = require("ibmiotf");
const request = require('request');
const config = require('../config');
const ConfigStore = require('configstore');

const conf = new ConfigStore(config.APP_SHORT_NAME);

const deviceConfig = {
	"org": config.WATSON_IOT_ORG,
	"id": conf.get('sub_id'),
	"domain": "internetofthings.ibmcloud.com",
	"type": config.WATSON_IOT_DEVICE_TYPE,
	"auth-method": "token",
	"auth-token": config.WATSON_IOT_REGISTER_PASSWORD,
	"enforce-ws": true
};

function register(sub_id) {
	request({
		uri: config.WATSON_IOT_REGISTER_URL,
		headers: {
			'Content-Type': 'application/json'
		},
		auth: {
			'username': config.WATSON_IOT_API_USERNAME,
			'password': config.WATSON_IOT_API_PASSWORD,
			'sendImmediately': true
		},
		body: JSON.stringify([
			{
				"typeId": config.WATSON_IOT_DEVICE_TYPE,
				"deviceId": sub_id,
				"deviceInfo": {
					"serialNumber": sub_id
				},
				"metadata": {},
				"authToken": config.WATSON_IOT_REGISTER_PASSWORD
			}
		]),
		method: 'POST'
	}, function (err, res, body) {
		if (err) {
			console.error(err)
		}
	});
}


function getMessages() {
	const deviceClient = new Client.IotfDevice(deviceConfig);
	deviceClient.connect();
	deviceClient.on("command", function (commandName, format, payload, topic) {
		if (commandName === 'published_message') {
		}
	});

	deviceClient.on("error", function (err) {
		console.error(err)
	});
}
