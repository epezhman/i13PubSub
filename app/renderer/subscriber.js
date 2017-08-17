'use strict';

const {remote} = require('electron');
const subscriber = remote.require('../lib/subscribe');
const ConfigStore = require('configstore');
const config = require('../config');

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
let registerError;

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

function getMessages() {
	let getM = subscriber.getMessages();
	getM.then((res) => {
		if (res !== "None") {
			receivedMessages.prepend('<b>Topic</b>: ' + res[0].topic + ', <b>Message</b>: ' + res[0].message + '<br>');
		}
	});
	setTimeout(getMessages, 1000);
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
	registerError = $('#register-error');

	getTopics();
	getMessages();

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
