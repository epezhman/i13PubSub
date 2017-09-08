'use strict';

const request = require('request');
const config = require('../config');
const requestPromise = require('request-promise');


module.exports.publishTopicsBased = publishTopicsBased;
module.exports.publishContentsBased = publishContentsBased;

function publishTopicsBased(topics, message, stateless, supportPolling) {
	request.post({
		url: stateless ? config.PUBLISH_STATELESS_URL : config.PUBLISH_URL,
		form: {
			topics: topics,
			message: message,
			polling_supported: supportPolling
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}

function publishContentsBased(predicates, message) {
	request.post({
		url: config.PUBLISH_CONTENT_BASED_URL,
		form: {
			predicates: JSON.stringify(predicates),
			message: message
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}
