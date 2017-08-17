'use strict';

const {remote} = require('electron');
const publish = remote.require('../lib/publish');

let pubTopics;
let pubMessage;
let pubForm;
let pubSubmit;
let pubPublished;

function publishMessage(topics, message) {
	publish(topics, message);
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
});
