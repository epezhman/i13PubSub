'use strict';

module.exports.subscribeTopic = subscribeTopic;
module.exports.unsubscribeTopic = unsubscribeTopic;
module.exports.register = register;
module.exports.testRegister = testRegister;
module.exports.getTopics = getTopics;
module.exports.subscribePredicates = subscribePredicates;
module.exports.subscribeFunction = subscribeFunction;
module.exports.unsubscribeFunction = unsubscribeFunction;

const requestp = require('request-promise');
const iot = require('./iot');
const request = require('request');
const config = require('../config');
const ConfigStore = require('configstore');

const conf = new ConfigStore(config.APP_SHORT_NAME);

function subscribeTopic(topics) {
	request.post({
		url: config.SUBSCRIBE_TOPIC_URL,
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

function unsubscribeTopic(topics) {
	request.post({
		url: config.UNSUBSCRIBE_TOPIC_URL,
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

function subscribePredicates(predicates) {
	request.post({
		url: config.SUBSCRIBE_PREDICATES_URL,
		form: {
			predicates: JSON.stringify(predicates),
			subscriber_id: conf.get('sub_id')
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
			iot.register(result['sub_id']);
			return true
		}
		else {
			return false
		}
	}).catch((err) => {
		return false
	});
}


function testRegister() {
	let reg_options = {
		uri: config.REGISTER_SUBSCRIBER_URL,
		json: true
	};
	return requestp(reg_options).then((result) => {
		if (result.hasOwnProperty('ok')) {
			iot.register(result['sub_id']);
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

function subscribeFunction(sub_type, matching_input, matching_function) {
	request.post({
		url: config.SUBSCRIBE_FUNCTION_URL,
		form: {
			sub_type: sub_type,
			matching_input: matching_input,
			matching_function: matching_function,
			subscriber_id: conf.get('sub_id'),
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}

function unsubscribeFunction(sub_type) {
	request.post({
		url: config.UNSUBSCRIBE_FUNCTION_URL,
		form: {
			sub_type: sub_type,
			subscriber_id: conf.get('sub_id'),
		}
	}, (err, httpResponse, body) => {
		if (err) {
			console.error(err)
		}
	});
}
