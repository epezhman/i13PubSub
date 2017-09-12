'use strict';

const {remote} = require('electron');
const publish = remote.require('../lib/publish');
const utils = remote.require('../lib/utils');
const ConfigStore = require('configstore');
const config = require('../config');
const request = require('request');
const Client = require("ibmiotf");
const eachLimit = require('async/eachLimit');

const conf = new ConfigStore(config.APP_SHORT_NAME);

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

let readyToEval = false;
let devices = {};
let experimentLogs = {};
let subCounter = 0;
let doneCounter = 0;
let sumTime = 0;


function prepareSubscribers() {
	const subscribersList = config.SUBSCRIBERS.slice(0, subCount);
	const totalMessagesInExperiment = pubCount * topicsCount;
	eachLimit(subscribersList, 1, function (sub_id, cb) {
		subCounter += 1;
		devices[sub_id] = getSub(sub_id);
		experimentLogs[sub_id] = {};
		experimentLogs[sub_id]['subCounter'] = 0;
		console.log(subCounter + '. Connecting: ' + sub_id);
		devices[sub_id].connect();
		if (subCount === subCounter) {
			console.log('Ready for evaluations')
		}
		devices[sub_id].on("command", function (commandName, format, payload, topic) {
			if (commandName === 'published_message') {
				experimentLogs[sub_id]['subCounter'] += 1;
				if (experimentLogs[sub_id]['subCounter'] === 1) {
					experimentLogs[sub_id]['subStartTimestamp'] = Date.now();
				}
				else if (experimentLogs[sub_id]['subCounter'] === totalMessagesInExperiment) {
					experimentLogs[sub_id]['subEndTimestamp'] = Date.now();
					let evalTime = experimentLogs[sub_id]['subEndTimestamp'] - experimentLogs[sub_id]['subStartTimestamp'];
					sumTime += evalTime;
					console.log(`Eval done: ${evalTime} ms`);
					doneCounter += 1;
					if (doneCounter === subCounter) {
						console.log(`Eval over with average ${sumTime / doneCounter} ms`);
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
	doneCounter = 0;
	for (let sub in experimentLogs) {
		if (experimentLogs.hasOwnProperty(sub)) {
			experimentLogs[sub]['subCounter'] = 0;
		}
	}
}

function initEval(subscribers, topics, pubType) {
	if (pubType === 'topic-stateful' || pubType === 'topic-semi-stateful') {
		request.post({
			url: config.BULK_SUBSCRIBE_URL,
			form: {
				topics: config.TOPICS.slice(0, topics),
				subscribes: config.SUBSCRIBERS.slice(0, subscribers).toString()
			}
		}, (err, httpResponse, body) => {
			if (err) {
				console.error(err)
			}
		});
	} else if (pubType === 'content') {
		request.post({
			url: config.BULK_SUBSCRIBE_PREDICATES_URL,
			form: {
				predicates: JSON.stringify(config.SUBSCRIBERS),
				subscribes: config.SUBSCRIBERS.slice(0, subscribers).toString()
			}
		}, (err, httpResponse, body) => {
			if (err) {
				console.error(err)
			}
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

	watchChange.change(() => {
		readyToEval = false;
		evalSubmit.hide();
		initSubmit.show();
	});

	initSubmit.click((e) => {
		e.preventDefault();
		let subscribers = subCount.val();

		let topics = topicsCount.val();
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
		if (subscribers && topics && pubType) {
			initSubmit.hide();
			evalStatus.text('Initializing.....');
			initEval(subscribers, topics, pubType)
		}
		else {
			missingParams.show();
			missingParams.hide(2000);
		}
	});

	evalSubmit.click((e) => {
		e.preventDefault();
		let publications = pubCount.val();
		let delays = delayMs.val();
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

		}
		else {
			missingParams.show();
			missingParams.hide(2000);
		}

	});

});
