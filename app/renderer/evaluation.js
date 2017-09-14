'use strict';

const Client = require("ibmiotf");
const eachLimit = require('async/eachLimit');
const eachSeries = require('async/eachSeries');
const config = require('../config');
const openwhisk = require('openwhisk');

const openWhiskOptions = {
	apihost: config.OPENWHISK_API_HOST,
	api_key: config.OPENWHISK_API_KEY
};

let ows = openwhisk(openWhiskOptions);

let subCount;
let pubCount;
let delayMs;
let topicsCount;
let onlineCount;
let sentPub;
let pubTime;
let subTime;
let evalStatus;
let initSubmit;
let evalSubmit;
let readyMessage;
let missingParams;
let typeRadios;
let watchChange;
let gotMessages;

let readyToEval = false;
let finishedSuccessfully = false;
let checkSuccessTimeout = null;

let devices = {};
let experimentLogs = {};
let subCounter = 0;
let doneCounter = 0;
let sumTime = 0;
let totalGotMessageCounter = 0;
let totalMessagesInExperiment = 0;


function checkSuccess() {
	if (checkSuccessTimeout) {
		clearTimeout(checkSuccessTimeout);
	}
	if (finishedSuccessfully) {
		evalStatus.text('Evaluation Finished Successfully');
	}
	else {
		evalStatus.text('Evaluation Failed');
	}
	evalSubmit.show();
}

function publishMessages(publicationsCount, delayMS) {
	resetValues();
	finishedSuccessfully = false;
	evalStatus.text('Performing Evaluation....');
	evalSubmit.hide();
	if (checkSuccessTimeout) {
		clearTimeout(checkSuccessTimeout);
	}
	let type = $('input[name=evaluation-type]:checked').val();
	let topicCount = topicsCount.val();
	let startTime = Date.now();
	let publications = Array.apply(null, {length: publicationsCount}).map(Number.call, Number);
	let meta = null;
	if (type === 'content') {
		meta = JSON.stringify(config.PUB_PREDICATE);
	}
	else {
		meta = config.TOPICS.slice(0, topicCount).toString();
	}
	eachSeries(publications, (counter, cb) => {
		if (type === 'topic-stateful') {
			publishTopicsBasedStateful(meta, 'Message ' + counter, delayMS, cb);
		}
		else if (type === 'topic-semi-stateful') {
			publishTopicsBasedSemiStateful(meta, 'Message ' + counter, delayMS, cb);
		}
		else if (type === 'topic-semi-stateful-with-time-decoupling') {
			publishTopicsBasedSemiStatefulTimeDecoupling(meta, 'Message ' + counter, delayMS, cb);
		}
		else if (type === 'content') {
			publishContentsBased(meta, 'Message ' + counter, delayMS, cb);
		}
		sentPub.val(counter + 1);

	}, (err) => {
		if (err) {
			console.log(err)
		}
		pubTime.val(Date.now() - startTime);
		checkSuccessTimeout = setTimeout(checkSuccess, 15000);
	});
}

function publishTopicsBasedStateful(topics, message, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish",
		blocking: true,
		result: true,
		params: {
			topics: topics,
			message: message
		}
	}).then(result => {
		setTimeout(cb, delayMs);
	}).catch(err => {
		console.error(err)
	});
}

function publishTopicsBasedSemiStateful(topics, message, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish_stateless",
		blocking: true,
		result: true,
		params: {
			topics: topics,
			message: message,
			polling_supported: false
		}
	}).then(result => {
		setTimeout(cb, delayMs);
	}).catch(err => {
		console.error(err)
	});
}

function publishTopicsBasedSemiStatefulTimeDecoupling(topics, message, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish_stateless",
		blocking: true,
		result: true,
		params: {
			topics: topics,
			message: message,
			polling_supported: true
		}
	}).then(result => {
		setTimeout(cb, delayMs);
	}).catch(err => {
		console.error(err)
	});
}

function publishContentsBased(predicates, message, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish_content_based_stateless",
		blocking: true,
		result: true,
		params: {
			predicates: predicates,
			message: message
		}
	}).then(result => {
		setTimeout(cb, delayMs);
	}).catch(err => {
		console.error(err)
	});
}

function prepareSubscribers(subscribers, topicsCount, publicationsCount) {
	const subscribersList = config.SUBSCRIBERS.slice(0, subscribers);
	eachLimit(subscribersList, 1, function (sub_id, cb) {
		subCounter += 1;
		devices[sub_id] = getSub(sub_id);
		experimentLogs[sub_id] = {};
		experimentLogs[sub_id]['subCounter'] = 0;
		onlineCount.val(subCounter);
		devices[sub_id].connect();
		if (subscribers === subCounter) {
			readyMessage.show();
			readyMessage.hide(2000);
			evalStatus.text('Ready for Evaluations');
			initSubmit.hide();
			evalSubmit.show();
		}
		devices[sub_id].on("command", function (commandName, format, payload, topic) {
			if (commandName === 'published_message') {
				experimentLogs[sub_id]['subCounter'] += 1;
				totalGotMessageCounter += 1;
				gotMessages.val(totalGotMessageCounter);
				if (experimentLogs[sub_id]['subCounter'] === 1) {
					experimentLogs[sub_id]['subStartTimestamp'] = Date.now();
				}
				else if (experimentLogs[sub_id]['subCounter'] === totalMessagesInExperiment) {
					experimentLogs[sub_id]['subEndTimestamp'] = Date.now();
					sumTime += (experimentLogs[sub_id]['subEndTimestamp'] - experimentLogs[sub_id]['subStartTimestamp']);
					doneCounter += 1;
					if (doneCounter === subCounter) {
						subTime.val(Math.round(sumTime / doneCounter));
						finishedSuccessfully = true;
						checkSuccess();
					}
				}
			}
		});
		cb();
	}, function (err) {
		if (err) {
			console.log(err)
		}
	});
}

function getSub(sub_id) {
	const deviceConfig = {
		"org": config.WATSON_IOT_ORG,
		"id": sub_id,
		"domain": "internetofthings.ibmcloud.com",
		"type": config.WATSON_IOT_DEVICE_TYPE,
		"auth-method": "token",
		"auth-token": config.WATSON_IOT_REGISTER_PASSWORD,
		"enforce-ws": true
	};
	return new Client.IotfDevice(deviceConfig);
}

function resetValues() {
	sumTime = 0;
	sentPub.val(0);
	pubTime.val(0);
	subTime.val(0);
	doneCounter = 0;
	totalGotMessageCounter = 0;
	gotMessages.val(0);
	for (let sub in experimentLogs) {
		if (experimentLogs.hasOwnProperty(sub)) {
			experimentLogs[sub]['subCounter'] = 0;
		}
	}
}

function resetPrepareDevices(subscribers, topics, publications) {
	sumTime = 0;
	sentPub.val(0);
	pubTime.val(0);
	subTime.val(0);
	onlineCount.val(0);
	doneCounter = 0;
	onlineCount.val(0);
	subCounter = 0;
	totalGotMessageCounter = 0;
	gotMessages.val(0);
	for (let sub in devices) {
		if (devices.hasOwnProperty(sub)) {
			devices[sub].disconnect();
		}
	}
	devices = {};
	experimentLogs = {};
	prepareSubscribers(subscribers, topics, publications);
}

function initEval(subscribers, topics, pubType, publications) {
	if (pubType === 'topic-stateful' || pubType === 'topic-semi-stateful'
		|| pubType === 'topic-semi-stateful-with-time-decoupling') {
		ows.actions.invoke({
			name: "pubsub/bulk_subscribe",
			blocking: true,
			result: true,
			params: {
				topics: config.TOPICS.slice(0, topics).toString(),
				subscribes: config.SUBSCRIBERS.slice(0, subscribers).toString()
			}
		}).then(result => {
			resetPrepareDevices(subscribers, topics, publications);
		}).catch(err => {
			console.error(err)
		});
	} else if (pubType === 'content') {
		ows.actions.invoke({
			name: "pubsub/bulk_subscribe_predicates",
			blocking: true,
			result: true,
			params: {
				predicates: JSON.stringify(config.SUB_PREDICATES),
				subscribes: config.SUBSCRIBERS.slice(0, subscribers).toString()
			}
		}).then(result => {
			resetPrepareDevices(subscribers, topics, publications);
		}).catch(err => {
			console.error(err)
		});
	}
}

$(document).ready(() => {
	subCount = $('#sub-count');
	pubCount = $('#message-count');
	delayMs = $('#delay-ms');
	topicsCount = $('#assigned-topics');
	onlineCount = $('#online-subscribers');
	sentPub = $('#sent-publication');
	pubTime = $('#publications-time');
	subTime = $('#subscriptions-time');
	evalStatus = $('#evaluation-status');
	initSubmit = $('#init-eval');
	evalSubmit = $('#run-eval');
	readyMessage = $('#eval-ready');
	missingParams = $('#setting-missing');
	typeRadios = $('input[name=evaluation-type]');
	watchChange = $('.watch-change');
	gotMessages = $('#got-publication');

	watchChange.change(() => {
		readyToEval = false;
		evalSubmit.hide();
		initSubmit.show();
	});

	initSubmit.click((e) => {
		e.preventDefault();
		let subscribers = parseInt(subCount.val());
		let publications = parseInt(pubCount.val());
		let topics = parseInt(topicsCount.val());
		let pubType = $('input[name=evaluation-type]:checked').val();
		if (subscribers && subscribers > 1000) {
			subscribers = 1000;
			subCount.val(1000);
		} else if (subscribers && subscribers < 1) {
			subscribers = 1;
			subCount.val(1);
		}
		if (topics && topics > 5) {
			topics = 5;
			topicsCount.val(5);
		} else if (topics && topics < 1) {
			topics = 1;
			topicsCount.val(1);
		}
		if (publications && publications > 100) {
			publications = 100;
			pubCount.val(100);
		} else if (publications && publications < 1) {
			publications = 1;
			pubCount.val(1);
		}
		if (subscribers && topics && publications && pubType) {
			initSubmit.hide();
			evalStatus.text('Initializing.....');
			totalMessagesInExperiment = publications * topics;
			initEval(subscribers, topics, pubType, publications)
		}
		else {
			missingParams.show();
			missingParams.hide(2000);
		}
	});

	evalSubmit.click((e) => {
		e.preventDefault();
		let publications = parseInt(pubCount.val());
		let delays = parseInt(delayMs.val());
		let topics = parseInt(topicsCount.val());

		if (publications && publications > 100) {
			publications = 100;
			pubCount.val(100);
		} else if (publications && publications < 1) {
			publications = 1;
			pubCount.val(1);
		}
		if (delays && delays < 0) {
			delays = 0;
			delayMs.val(0);
		}
		if (publications && delays >= 0) {
			totalMessagesInExperiment = publications * topics;
			publishMessages(publications, delays)
		}
		else {
			missingParams.show();
			missingParams.hide(2000);
		}
	});
});
