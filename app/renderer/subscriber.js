'use strict';

const {remote} = require('electron');
const subscriber = remote.require('../lib/subscribe');
const utils = remote.require('../lib/utils');
const ConfigStore = require('configstore');
const config = require('../config');
const Client = require('ibmiotf');
const moment = require('moment');
const array = require('lodash/array');

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
let functionSubType;
let functionSubInput;
let functionSubDef;
let functionSubButton;
let functionUnsubButton;
let functionUnsubType;
let functionSubMessage;
let functionUnsubMessage;
let functionSubForm;
let functionUnsubForm;
let functionSubbed;

let counterReal = 0;

function subscribeTopics(topics) {
	subscriber.subscribeTopic(topics);
	subForm[0].reset();
	subConfirmed.show();
	subConfirmed.hide(2000);
	let tempStoredTopics = [];
	if (conf.has('topics_sub')) {
		tempStoredTopics = conf.get('topics_sub');
	}
	let tempTopics = topics.split(',');
	tempTopics.forEach((topic) => {
		topic = topic.trim();
		tempStoredTopics = array.union(tempStoredTopics, [topic]);
	});
	conf.set('topics_sub', tempStoredTopics);
	alreadySubbedTopics.text(conf.get('topics_sub'));
}

function unsubscribeTopics(topics) {
	subscriber.unsubscribeTopic(topics);
	unsubForm[0].reset();
	unsubConfirmed.show();
	unsubConfirmed.hide(2000);
	let tempStoredTopics = [];
	if (conf.has('topics_sub')) {
		tempStoredTopics = conf.get('topics_sub');
	}
	let tempTopics = topics.split(',');
	tempTopics.forEach((topic) => {
		topic = topic.trim();
		tempStoredTopics = array.remove(tempStoredTopics, function (storedTopic) {
			return storedTopic !== topic
		});
	});
	conf.set('topics_sub', tempStoredTopics);
	alreadySubbedTopics.text(conf.get('topics_sub'));
}

function subscribeFunctions(sub_type, inputs, func_sub) {
	subscriber.subscribeFunction(sub_type, inputs, func_sub);
	functionSubForm[0].reset();
	functionSubMessage.show();
	functionSubMessage.hide(2000);
	let tempStoredFunctions = [];
	if (conf.has('func_sub')) {
		tempStoredFunctions = conf.get('func_sub');
	}
	sub_type = sub_type.trim();
	tempStoredFunctions = array.union(tempStoredFunctions, [sub_type]);
	conf.set('func_sub', tempStoredFunctions);
	functionSubbed.text(conf.get('func_sub'));
}

function unsubscribeFunctions(sub_type) {
	subscriber.unsubscribeFunction(sub_type);
	functionUnsubForm[0].reset();
	functionUnsubMessage.show();
	functionUnsubMessage.hide(2000);
	let tempStoredFunctions = [];
	if (conf.has('func_sub')) {
		tempStoredFunctions = conf.get('func_sub');
	}
	sub_type = sub_type.trim();
	tempStoredFunctions = array.remove(tempStoredFunctions, function (storedFunc) {
		return storedFunc !== sub_type
	});
	conf.set('func_sub', tempStoredFunctions);
	functionSubbed.text(conf.get('func_sub'));
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
							predicates += `${predicate}: ${payload['predicates'][predicate]}, `
					}
					receivedMessagesRealTime.prepend('<tr><td>' + predicates + '</td><td>'
						+ payload['message'] + '</td><td>' + moment(payload['time']).format("DD-MM-YYYY HH:mm:ss") + '</td></tr>');
				}
				else if (payload.hasOwnProperty('function_type')) {
					receivedMessagesRealTime.prepend('<tr><td>' + payload['function_type'] + '</td><td>'
						+ payload['message'] + '</td><td>' + moment(payload['time']).format("DD-MM-YYYY HH:mm:ss") + '</td></tr>');
				}
			}
		});
		deviceClient.on("error", function (err) {
			console.error(err)
		});
	}
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
	functionSubType = $('#function-type');
	functionSubInput = $('#function-inputs');
	functionSubDef = $('#function-def');
	functionSubButton = $('#function-submit');
	functionSubMessage = $('#functions-confirmed');
	functionUnsubButton = $('#unsub-function-submit');
	functionUnsubType = $('#unsub-functions');
	functionUnsubMessage = $('#unsubed-function-confirmed');
	functionSubForm = $('#function-form');
	functionUnsubForm = $('#unsub-function-form');
	functionSubbed = $('#subbed-functions');

	if (conf.has('predicates')) {
		storedPredicates.text(conf.get('predicates'));
	}

	if (conf.has('topics_sub')) {
		alreadySubbedTopics.text(conf.get('topics_sub'));
	}

	if (conf.has('func_sub')) {
		functionSubbed.text(conf.get('func_sub'));
	}

	if (conf.has('sub_id')) {
		getMessagesRealTime();
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

	functionSubButton.click((e) => {
		e.preventDefault();
		let funcType = functionSubType.val().trim();
		let funcInputs = functionSubInput.val().trim();
		let funcDef = functionSubDef.val().trim();
		if (funcType && funcInputs && funcDef) {
			subscribeFunctions(funcType, funcInputs, funcDef);
		}
	});

	functionUnsubButton.click((e) => {
		e.preventDefault();
		let funcType = functionUnsubType.val().trim();
		if (funcType) {
			unsubscribeFunctions(funcType);
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
