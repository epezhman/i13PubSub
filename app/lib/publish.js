'use strict';

const request = require('request');
const config = require('../config');

module.exports.publishTopicsBased = publishTopicsBased;
module.exports.publishContentsBased = publishContentsBased;
module.exports.publishFunctionBased = publishFunctionBased;

function publishTopicsBased(topics, message) {
	request.post({
		url: config.PUBLISH_TOPIC_BASED_URL,
		form: {
			topics: topics,
			message: message,
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

function publishFunctionBased(sub_type, message) {
	request.post({
		url: config.PUBLISH_FUNCTION_BASED_URL,
		form: {
			sub_type: sub_type,
			message: message,
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}
