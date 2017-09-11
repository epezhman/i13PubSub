'use strict';

const {remote} = require('electron');
const publish = remote.require('../lib/publish');
const utils = remote.require('../lib/utils');
const ConfigStore = require('configstore');
const config = require('../config');

const conf = new ConfigStore(config.APP_SHORT_NAME);

let pubTopics;
let pubMessage;
let pubSubmit;
let pubSubmitCounter;
let pubSpanCounter;
let pubPublished;
let publishStateless;
let supportPolling;
let pubErrorTopicsMissing;
let pubErrorPredicatesMissing;
let pubErrorMessageMissing;
let predicatesArea;

function publishTopicBasedMessage(topics, message) {
	publish.publishTopicsBased(topics, message, publishStateless.is(':checked'), supportPolling.is(':checked'));
	pubPublished.show();
	pubPublished.hide(2000);
}

function publishContentBasedMessage(predicates, message) {
	publish.publishContentsBased(predicates, message);
	pubPublished.show();
	pubPublished.hide(2000);
}

$(document).ready(() => {

	pubTopics = $('#pub-topics');
	pubMessage = $('#pub-message');
	pubSubmit = $('#pub-submit');
	pubPublished = $('#pub-published');
	pubSubmitCounter = $('#pub-submit-counter');
	pubSpanCounter = $('#counter-span');
	publishStateless = $('#publish-stateless');
	supportPolling = $('#support-polling');
	pubErrorMessageMissing = $('#pub-error-message');
	pubErrorPredicatesMissing = $('#pub-error-predicates');
	pubErrorTopicsMissing = $('#pub-error-topics');
	predicatesArea = $('#predicates');

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

	pubSubmit.click((e) => {
		e.preventDefault();
		let selectedPubType = $('input[name=publish-type]:checked').val();
		let topics = pubTopics.val().trim();
		let predicates = predicatesArea.val().trim();
		let jsonPredicate = utils.JSONifyPublisherPredicates(predicates);

		let message = pubMessage.val().trim();
		if (!topics && selectedPubType === 'topic') {
			pubErrorTopicsMissing.show();
			pubErrorTopicsMissing.hide(2000);
		}
		if (!jsonPredicate && selectedPubType === 'content') {
			pubErrorPredicatesMissing.show();
			pubErrorPredicatesMissing.hide(2000);
		}
		if (!message) {
			pubErrorMessageMissing.show();
			pubErrorMessageMissing.hide(2000);
		}
		if (topics && message && selectedPubType === 'topic') {
			publishTopicBasedMessage(topics, message);
		}
		if (jsonPredicate && message && selectedPubType === 'content') {
			publishContentBasedMessage(jsonPredicate, message);
		}
	});

	pubSubmitCounter.click((e) => {
		e.preventDefault();
		let selectedPubType = $('input[name=publish-type]:checked').val();
		let topics = pubTopics.val().trim();
		let predicates = predicatesArea.val().trim();
		let jsonPredicate = utils.JSONifyPublisherPredicates(predicates);

		if (!topics && selectedPubType === 'topic') {
			pubErrorTopicsMissing.show();
			pubErrorTopicsMissing.hide(2000);
		}
		if (!jsonPredicate && selectedPubType === 'content') {
			pubErrorPredicatesMissing.show();
			pubErrorPredicatesMissing.hide(2000);
		}
		if (topics && selectedPubType === 'topic') {
			counter += 1;
			pubSpanCounter.text(counter);
			publishTopicBasedMessage(topics, counter.toString());
		}
		if (jsonPredicate && selectedPubType === 'content') {
			counter += 1;
			pubSpanCounter.text(counter);
			publishContentBasedMessage(jsonPredicate, counter.toString());
		}
	});

});
