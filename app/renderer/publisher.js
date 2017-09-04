'use strict';

const {remote} = require('electron');
const publish = remote.require('../lib/publish');
const ConfigStore = require('configstore');
const config = require('../config');

const conf = new ConfigStore(config.APP_SHORT_NAME);

let pubTopics;
let pubMessage;
let pubForm;
let pubSubmit;
let pubSubmitCounter;
let pubSpanCounter;
let pubPublished;
let publishStateless;
let supportPolling;

function publishMessage(topics, message) {
	publish(topics, message, publishStateless.is(':checked'), supportPolling.is(':checked'));
	//pubForm[0].reset();
	pubPublished.show();
	pubPublished.hide(2000);
}

$(document).ready(() => {

	pubTopics = $('#pub-topics');
	pubMessage = $('#pub-message');
	pubForm = $('#pub-form');
	pubSubmit = $('#pub-submit');
	pubPublished = $('#pub-published');
	pubSubmitCounter = $('#pub-submit-counter');
	pubSpanCounter = $('#counter-span');
	publishStateless = $('#publish-stateless');
	supportPolling = $('#support-polling');

	let counter = 0;

	if (conf.get('stateless')) {
		publishStateless.prop('checked', true);
	}

	publishStateless.on('change', () => {
		if (publishStateless.is(':checked')) {
			conf.set('stateless', true);
		}
		else {
			conf.set('stateless', false);
		}
	});

	pubForm.on('submit', (e) => {
		e.preventDefault();
		let topics = pubTopics.val().trim();
		let message = pubMessage.val().trim();
		if (topics && message) {
			publishMessage(topics, message);
		}
	});

	pubSubmit.click((e) => {
		e.preventDefault();
		let topics = pubTopics.val().trim();
		let message = pubMessage.val().trim();
		if (topics && message) {
			publishMessage(topics, message);
		}
	});

	pubSubmitCounter.click((e) => {
		e.preventDefault();
		let topics = pubTopics.val().trim();
		if (topics) {
			counter += 1;
			pubSpanCounter.text(counter);
			publishMessage(topics, counter.toString());
		}
	});
});
