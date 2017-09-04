'use strict';

const {remote} = require('electron');
const publish = remote.require('../lib/publish');

let pubTopics;
let pubMessage;
let pubForm;
let pubSubmit;
let pubSubmitCounter;
let pubSpanCounter;
let pubPublished;
let publishStateless;

function publishMessage(topics, message) {
	publish(topics, message, publishStateless.is(':checked'));
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

	let counter = 0;

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
