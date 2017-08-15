'use strict';

const {remote} = require('electron');
const subscriber = remote.require('../lib/subscribe');

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


$(document).ready(() => {
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

});
