'use strict';

const {remote} = require('electron');
const subscriber = remote.require('../lib/subscribe');
const utils = remote.require('../lib/utils');
const ConfigStore = require('configstore');
const config = require('../config');
const Client = require('ibmiotf');
const moment = require('moment');

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
let enablePolling;
let subscribedPredicates;
let predicateSubmit;
let predicatesConfirmed;
let predicatesFormatError;
let storedPredicates;

let counterReal = 0;

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

function getTopics(manual) {
	if (conf.has('sub_id')) {
		let getT = subscriber.getTopics();
		getT.then((res) => {
			alreadySubbedTopics.text(res);
		});
	}
	if (!manual) {
		setTimeout(getTopics, 2000);
	}
}

function updateLastSeen() {
	if (conf.has('sub_id')) {
		subscriber.updateLastSeen();
	}
	setTimeout(updateLastSeen, 2000);
}

function getMessagesPolling() {
	if (conf.has('sub_id')) {
		let getM = subscriber.getMessages();
		getM.then((result) => {
			if (result !== "None") {
				result.forEach((res) => {
					counterReal += 1;
					realTimeMessageCounter.text(counterReal);
					receivedMessagesRealTime.prepend('<tr><td>' + res.topic + '</td><td>'
						+ res.message + '</td><td>' + moment(res.timestamp).format("DD-MM-YYYY HH:mm:ss") + '</td></tr>');
				});
			}
		});
	}
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
				if (payload.hasOwnProperty('topic')) {
					receivedMessagesRealTime.prepend('<tr><td>' + payload['topic'] + '</td><td>'
						+ payload['message'] + '</td><td>' + moment(payload['time']).format("DD-MM-YYYY HH:mm:ss") + '</td></tr>');
				}
				else if (payload.hasOwnProperty('predicates')) {
					let predicates = '';
					for (let predicate in payload['predicates']) {
						if (payload['predicates'].hasOwnProperty(predicate))
							predicates += `${predicate}: ${payload['predicates'][predicate]}`
					}
					receivedMessagesRealTime.prepend('<tr><td>' + predicates + '</td><td>'
						+ payload['message'] + '</td><td>' + moment(payload['time']).format("DD-MM-YYYY HH:mm:ss") + '</td></tr>');
				}
			}
		});
		deviceClient.on("error", function (err) {
			console.error(err)
		});
	}
}

function initFunctions() {
	conf.set('stateless', true);
	getTopics();
	getMessagesPolling();
	setTimeout(updateLastSeen, 5000);
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
	enablePolling = $('#enable-polling');
	subscribedPredicates = $('#predicates');
	storedPredicates = $('#subbed-predicates');
	predicateSubmit = $('#predicate-submit');
	predicatesConfirmed = $('#predicates-confirmed');
	predicatesFormatError = $('#predicates-format-error');

	if (conf.has('predicates')) {
		storedPredicates.text(conf.get('predicates'));
	}

	if (conf.has('sub_id')) {
		initFunctions();
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

	predicateSubmit.click((e) => {
		e.preventDefault();
		let predicates = subscribedPredicates.val().trim();
		if (predicates.length) {
			let jsonPredicate = utils.JSONifySubscriberPredicates(predicates);
			if (jsonPredicate) {
				subscriber.subscribePredicates(jsonPredicate);
				subscribedPredicates.val('');
				conf.set('predicates', predicates);
				storedPredicates.text(predicates);
				predicatesConfirmed.show();
				predicatesConfirmed.hide(2000);
			}
			else {
				predicatesFormatError.show();
				predicatesFormatError.hide(2000);
			}
		}
		else {
			subscriber.subscribePredicates({});
			subscribedPredicates.val('');
			conf.delete('predicates');
			storedPredicates.text('');
			predicatesConfirmed.show();
			predicatesConfirmed.hide(2000);
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
		//autoReg();
		if (confirm('Are you sure?')) {
			subscriberId.val('');
			conf.delete('sub_id');
			registerSub.show();
			subActions.hide();
		}
	});

});
