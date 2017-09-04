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
let pollMessageCounter;
let subscriberId;

let counterReal = 0;
let counterPoll = 0;

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
	if (conf.has('sub_id')) {

		let getT = subscriber.getTopics();
		getT.then((res) => {
			alreadySubbedTopics.text(res);
		});
	}
	setTimeout(getTopics, 2000);
}

function getMessagesPolling(firstRun) {
	if (conf.has('sub_id')) {
		let getM = subscriber.getMessages();
		getM.then((result) => {
			if (result !== "None") {
				if (firstRun) {
					result.forEach((res) => {
						counterReal += 1;
						realTimeMessageCounter.text(counterReal);
						receivedMessagesRealTime.prepend('<b>Topic</b>: ' + res.topic + ', <b>Message</b>: '
							+ res.message + ', <b>Time</b>: ' + res.time + '</br>');
					});
				}
				result.forEach((res) => {
					counterPoll += 1;
					pollMessageCounter.text(counterPoll);
					receivedMessages.prepend('<b>Topic</b>: ' + res.topic + ', <b>Message</b>: ' + res.message
						+ ', <b>Time</b>: ' + res.time + '</br>');
				});
			}
		});
	}
	setTimeout(getMessagesPolling, 2000);
}

function getMessagesRealTime() {
	if (conf.has('sub_id')) {
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
				counterReal += 1;
				realTimeMessageCounter.text(counterReal);
				payload = JSON.parse(payload);
				receivedMessagesRealTime.prepend('<b>Topic</b>: ' + payload['topic'] + ', <b>Message</b>: '
					+ payload['message'] + ', <b>Time</b>: ' + payload['time'] + '</br>');
			}
		});

		deviceClient.on("error", function (err) {
			console.error(err)
		});
	}
}

function initFunctions(firstRun) {
	getTopics();
	getMessagesPolling(firstRun);
	getMessagesRealTime();

}

let regCounter = 100;

function autoReg() {
	subscriber.testRegister();
	regCounter -= 1;
	if (regCounter > 0) {
		setTimeout(autoReg, 1000);
	}
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
	pollMessageCounter = $('#polling-message-counter');
	registerError = $('#register-error');
	subscriberId = $('#subscriber-id');

	if (conf.has('sub_id')) {
		initFunctions(true);
		subActions.show();
		subscriberId.val(conf.get('sub_id'))
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
				initFunctions();
				registerSub.hide();
				subActions.show();
				subscriberId.val(conf.get('sub_id'))
			}
			else {
				unsubConfirmed.show();
				unsubConfirmed.hide(2000);
			}
		})
	});


	deregisterSub.click((e) => {
		e.preventDefault();
		autoReg();
		// if (confirm('Are you sure?')) {
		// 	subscriberId.val('');
		// 	conf.delete('sub_id');
		// 	registerSub.show();
		// 	subActions.hide();
		// }
	});

});
