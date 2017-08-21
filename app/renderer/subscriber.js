'use strict';

const {remote} = require('electron');
const subscriber = remote.require('../lib/subscribe');
const iot = remote.require('../lib/iot');
const ConfigStore = require('configstore');
const config = require('../config');
const Client = require("ibmiotf");

const conf = new ConfigStore(config.APP_SHORT_NAME);

let registerSub;
let deregisterSub;
let subActions;
let subTopics;
let unsubTopics;
let subForm;
let unsubForm;
let subSubmit;
let unsubSubmit;
let subConfirmed;
let unsubConfirmed;
let alreadySubbedTopics;
let receivedMessages;
let receivedMessagesRealTime;
let registerError;
let realTimeMessageCounter;

function subscribeTopics(topics) {
	subscriber.subscribe(topics);
	subForm[0].reset();
	subConfirmed.show();
	subConfirmed.hide(2000);
}

function unsubscribeTopics(topics) {
	subscriber.unsubscribe(topics);
	unsubForm[0].reset();
	unsubConfirmed.show();
	unsubConfirmed.hide(2000);
}

function getTopics() {
	let getT = subscriber.getTopics();
	getT.then((res) => {
		alreadySubbedTopics.text(res);
	});
	setTimeout(getTopics, 1000);
}

function getMessagesPolling() {
	let getM = subscriber.getMessages();
	getM.then((res) => {
		if (res !== "None") {
			receivedMessages.prepend('<b>Topic</b>: ' + res[0].topic + ', <b>Message</b>: ' + res[0].message + '</br>');
		}
	});
	setTimeout(getMessagesPolling, 1000);
}

let counter = 0;

function getMessagesRealTime() {
	//iot.getMessages()
	const deviceConfig = {
		"org": config.WATSON_IOT_ORG,
		"id": conf.get('sub_id'),
		"domain": "internetofthings.ibmcloud.com",
		"type": config.WATSON_IOT_DEVICE_TYPE,
		"auth-method": "token",
		"auth-token": config.WATSON_IOT_REGISTER_PASSWORD,
		"enforce-ws": true
	};
	const deviceClient = new Client.IotfDevice(deviceConfig);
	deviceClient.connect();
	deviceClient.on("command", function (commandName, format, payload, topic) {
		if (commandName === 'published_message') {
			counter +=1;
			realTimeMessageCounter.text(counter);
			payload = JSON.parse(payload);
			receivedMessagesRealTime.prepend('<b>Topic</b>: ' + payload['topic'] + ', <b>Message</b>: '
				+ payload['message'] + ', <b>Time</b>: ' + payload['time'] + '</br>');
		}
	});

	deviceClient.on("error", function (err) {
		console.error(err)
	});
}

$(document).ready(() => {
	registerSub = $('#register-sub');
	deregisterSub = $('#deregister-sub');
	subActions = $('#subscriber-actions');
	subTopics = $('#sub-topics');
	unsubTopics = $('#unsub-topics');
	subForm = $('#sub-form');
	unsubForm = $('#unsub-form');
	subSubmit = $('#sub-submit');
	unsubSubmit = $('#unsub-submit');
	subConfirmed = $('#subbed-confirmed');
	unsubConfirmed = $('#unsubed-confirmed');
	alreadySubbedTopics = $('#already-subbed-topics');
	receivedMessages = $('#received-messages');
	receivedMessagesRealTime = $('#received-messages-real-time');
	realTimeMessageCounter = $('#real-time-message-counter');
	registerError = $('#register-error');

	getTopics();
	getMessagesPolling();
	getMessagesRealTime();


	if (conf.has('sub_id')) {
		subActions.show();
	}
	else {
		registerSub.show();
	}

	subForm.on('submit', (e) => {
		e.preventDefault();
		let topics = subTopics.val().trim();
		if (topics) {
			subscribeTopics(topics);
		}
	});

	subSubmit.click((e) => {
		e.preventDefault();
		let topics = subTopics.val().trim();
		if (topics) {
			subscribeTopics(topics);
		}
	});


	unsubForm.on('submit', (e) => {
		e.preventDefault();
		let topics = unsubTopics.val().trim();
		if (topics) {
			unsubscribeTopics(topics);
		}
	});

	unsubSubmit.click((e) => {
		e.preventDefault();
		let topics = unsubTopics.val().trim();
		if (topics) {
			unsubscribeTopics(topics);
		}
	});

	registerSub.click((e) => {
		e.preventDefault();
		let reg = subscriber.register();
		reg.then((res) => {
			if (res) {
				registerSub.hide();
				subActions.show();
			}
			else {
				unsubConfirmed.show();
				unsubConfirmed.hide(2000);
			}
		})
	});

	deregisterSub.click((e) => {
		e.preventDefault();
		conf.delete('sub_id');
		registerSub.show();
		subActions.hide();
	});

});
