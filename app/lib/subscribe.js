'use strict';

module.exports.subscribe = subscribe;
module.exports.unsubscribe = unsubscribe;
module.exports.register = register;
module.exports.getMessages = getMessages;
module.exports.getTopics = getTopics;

const requestp = require('request-promise');
const iot = require('./iot');
const request = require('request');
const config = require('../config');
const ConfigStore = require('configstore');

const conf = new ConfigStore(config.APP_SHORT_NAME);

function subscribe(topics) {
	request.post({
		url: config.SUBSCRIBE_URL,
		form: {
			topics: topics,
			subscriber_id: conf.get('sub_id'),
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}

function unsubscribe(topics) {
	request.post({
		url: config.UNSUBSCRIBE_URL,
		form: {
			topics: topics,
			subscriber_id: conf.get('sub_id'),
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}

function register() {
	let reg_options = {
		uri: config.REGISTER_SUBSCRIBER_URL,
		json: true
	};
	return requestp(reg_options).then((result) => {
		if (result.hasOwnProperty('ok')) {
			conf.set('sub_id', result['sub_id']);
			iot.register();
			return true
		}
		else {
			return false
		}
	}).catch((err) => {
		return false
	});
}

function getTopics() {
	let reg_options = {
		uri: config.GET_TOPICS_URL,
		qs: {
			subscriber_id: conf.get('sub_id')
		},
		json: true
	};
	return requestp(reg_options).then((result) => {
		if (result.hasOwnProperty('topics') && result['topics'].length) {
			return result['topics']
		}
		else {
			return "None"
		}
	}).catch((err) => {
		return "None"
	});
}

function getMessages() {
	let reg_options = {
		uri: config.GET_MESSAGES_URL,
		qs: {
			subscriber_id: conf.get('sub_id')
		},
		json: true
	};
	return requestp(reg_options).then((result) => {
		if (result.hasOwnProperty('docs') && result['docs'].length) {
			return result['docs']
		}
		else {
			return "None"
		}
	}).catch((err) => {
		return "None"
	});
}
