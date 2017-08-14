'use strict';

const request = require('request');
const config = require('../config');


module.exports.subscribe = subscribe;
module.exports.unsubscribe = unsubscribe;

function subscribe(topics) {
	request.post({
		url: config.SUBSCRIBE_URL,
		form: {
			topics: topics,
			subscriber_id: "b3b5fa70-7928-11e7-a5fb-d54e2f6a4032",
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		console.log(body)
	});
}

function unsubscribe(topics) {
	request.post({
		url: config.UNSUBSCRIBE_URL,
		form: {
			topics: topics,
			subscriber_id: "b3b5fa70-7928-11e7-a5fb-d54e2f6a4032",
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		console.log(body)
	});
}
