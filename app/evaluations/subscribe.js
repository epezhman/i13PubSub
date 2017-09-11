'use strict';

module.exports.subscribe = subscribe;
module.exports.unsubscribe = unsubscribe;

const request = require('request');
const config = require('../config');


function subscribe(topics, sub_id, cb) {
	request.post({
		url: config.SUBSCRIBE_URL,
		form: {
			topics: topics,
			subscriber_id: sub_id,
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		setTimeout(cb, 50);
	});
}

function unsubscribe(topics, sub_id, cb) {
	request.post({
		url: config.UNSUBSCRIBE_URL,
		form: {
			topics: topics,
			subscriber_id: sub_id,
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
		setTimeout(cb, 10);
	});
}
