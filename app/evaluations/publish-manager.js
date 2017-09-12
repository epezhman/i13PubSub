'use strict';

module.exports.publishMesages = publishMessages;

const config = require('../config');
const eachSeries = require('async/eachSeries');
const request = require('request');

function publishMessages(type, messageCount, delayMS, topicCount) {
	let startTime = Date.now();
	let publications = Array.apply(null, {length: messageCount}).map(Number.call, Number);
	let meta = null;
	switch (topicCount) {
		case -4:
			meta = JSON.stringify(config.PUB_PREDICATE_1);
			break;
		case -3:
			meta = JSON.stringify(config.PUB_PREDICATE_2);
			break;
		case -2:
			meta = JSON.stringify(config.PUB_PREDICATE_3);
			break;
		case -1:
			meta = JSON.stringify(config.PUB_PREDICATE_4);
			break;
		case 1:
			meta = config.TOPICS_1.toString();
			break;
		case 2:
			meta = config.TOPICS_2.toString();
			break;
		case 3:
			meta = config.TOPICS_3.toString();
			break;
		case 4:
			meta = config.TOPICS_4.toString();
			break;
		case 5:
			meta = config.TOPICS_5.toString();
			break;
	}

	eachSeries(publications, (counter, cb) => {
		if (type === 'topic-stateful') {
			publishTopicsBasedStateful(meta, 'Message ' + counter, cb, delayMS);
		} else if (type === 'topic-semi-stateful') {
			publishTopicsBasedSemiStateful(meta, 'Message ' + counter, cb, delayMS);
		} else if (type === 'content') {
			publishContentsBased(meta, 'Message ' + counter, cb, delayMS);
		}

	}, (err) => {
		if (err) {
			console.log(err)
		}
		console.log('Total Time:' + (Date.now() - startTime) + ' ms');
	});
}

function publishTopicsBasedStateful(topics, message, cb, delayMs) {
	request.post({
		url: config.PUBLISH_URL,
		form: {
			topics: topics,
			message: message
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		setTimeout(cb, delayMs);
	});
}

function publishTopicsBasedSemiStateful(topics, message, cb, delayMs) {
	request.post({
		url: config.PUBLISH_STATELESS_URL,
		form: {
			topics: topics,
			message: message,
			polling_supported: false
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		setTimeout(cb, delayMs);
	});
}

function publishContentsBased(predicates, message, cb, delayMs) {
	request.post({
		url: config.PUBLISH_CONTENT_BASED_URL,
		form: {
			predicates: predicates,
			message: message
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		setTimeout(cb, delayMs);
	});
}
