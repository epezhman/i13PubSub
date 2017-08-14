'use strict';

const request = require('request');
const config = require('../config');


module.exports = publish;

function publish(topics, message) {
	request.post({
		url: config.PUBLISH_URL,
		form: {topics: topics, message: message}
	}, (err, httpResponse, body) => {
		if(err)
		{
			console.error(err)
		}
		console.log(body)
	});
}
