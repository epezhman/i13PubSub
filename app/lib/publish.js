'use strict';

const request = require('request');
const config = require('../config');


module.exports = publish;

function publish(topics, message, stateless) {
	request.post({
		url: stateless ? config.PUBLISH_STATELESS_URL : config.PUBLISH_URL,
		form: {topics: topics, message: message}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}
