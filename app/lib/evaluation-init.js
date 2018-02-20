'use strict';

const Client = require("ibmiotf");
const eachLimit = require('async/eachLimit');
const config = require('../config');
const openwhisk = require('openwhisk');

const openWhiskOptions = {
	apihost: config.OPENWHISK_API_HOST,
	api_key: config.OPENWHISK_API_KEY
};

let ows = openwhisk(openWhiskOptions);

let finishedSuccessfully = false;

let devices = {};
let experimentLogs = {};
let subCounter = 0;
let doneCounter = 0;
let sumTime = 0;
let totalGotMessageCounter = 0;
let totalMessagesInExperiment = 0;

let eval_inputs = process.argv.slice(2);

let eval_type = eval_inputs[0]; // topic, content, function
let eval_cofig = config.EVALS[eval_inputs[1]]; // eval_1_1 ...
let eval_sub_seq = eval_inputs[2]; // 0, 1, 2, 3 ...

let subscribers = eval_cofig['sub_count'] / config.EVAL_NODE_COUNT;
let publications = eval_cofig['pub_count'];
let topics = config.EVAL_TOPICS;
let pubType = eval_type;


function prepareSubscribers(subscribers, subscribers_seq) {
	const subscribersList = config.SUBSCRIBERS.slice(subscribers_seq * subscribers,
		(subscribers_seq * subscribers) + subscribers);
	eachLimit(subscribersList, 1, function (sub_id, cb) {
		subCounter += 1;
		devices[sub_id] = getSub(sub_id);
		experimentLogs[sub_id] = {};
		experimentLogs[sub_id]['subCounter'] = 0;
		devices[sub_id].connect();
		if (subscribers === subCounter) {
			console.log('Ready for Evaluations!');
		}
		devices[sub_id].on("command", function (commandName, format, payload, topic) {
			if (commandName === 'published_message') {
				experimentLogs[sub_id]['subCounter'] += 1;
				totalGotMessageCounter += 1;
				console.log("Received Message Counter: " + totalGotMessageCounter);
				if (experimentLogs[sub_id]['subCounter'] === 1) {
					experimentLogs[sub_id]['subStartTimestamp'] = Date.now();
				}
				else if (experimentLogs[sub_id]['subCounter'] === totalMessagesInExperiment) {
					experimentLogs[sub_id]['subEndTimestamp'] = Date.now();
					sumTime += (experimentLogs[sub_id]['subEndTimestamp'] - experimentLogs[sub_id]['subStartTimestamp']);
					doneCounter += 1;
					if (doneCounter === subCounter) {
						console.log("Average Message Latency: " + Math.round(sumTime / doneCounter));
						finishedSuccessfully = true;
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

function resetPrepareDevices(subscribers, subscribers_seq) {
	sumTime = 0;
	doneCounter = 0;
	subCounter = 0;
	totalGotMessageCounter = 0;
	for (let sub in devices) {
		if (devices.hasOwnProperty(sub)) {
			devices[sub].disconnect();
		}
	}
	devices = {};
	experimentLogs = {};
	prepareSubscribers(subscribers, subscribers_seq);
}

function initEval(subscribers, subscribers_seq, topics, pubType, publications) {
	if (pubType === 'topic') {
		ows.actions.invoke({
			name: "pubsub/bulk_subscribe_topics",
			blocking: true,
			result: true,
			params: {
				topics: config.TOPICS.slice(0, topics).toString(),
				subscribes: config.SUBSCRIBERS.slice(subscribers_seq * subscribers,
					(subscribers_seq * subscribers) + subscribers).toString()
			}
		}).then(result => {
			resetPrepareDevices(subscribers, subscribers_seq);
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
				subscribes: config.SUBSCRIBERS.slice(subscribers_seq * subscribers,
					(subscribers_seq * subscribers) + subscribers).toString()
			}
		}).then(result => {
			resetPrepareDevices(subscribers, subscribers_seq);
		}).catch(err => {
			console.error(err)
		});
	}
	else if (pubType === 'function') {
		ows.actions.invoke({
			name: "pubsub/bulk_subscribe_function",
			blocking: true,
			result: true,
			params: {
				sub_type: config.FUNCTION_SUB.sub_type,
				matching_input: config.FUNCTION_SUB.matching_input,
				matching_function: config.FUNCTION_SUB.matching_function,
				subscribers: config.SUBSCRIBERS.slice(subscribers_seq * subscribers,
					(subscribers_seq * subscribers) + subscribers).toString()
			}
		}).then(result => {
			resetPrepareDevices(subscribers, subscribers_seq);
		}).catch(err => {
			console.error(err)
		});
	}
}


if (subscribers && subscribers > 1000) {
	subscribers = 1000;
} else if (subscribers && subscribers < 1) {
	subscribers = 1;
}
if (topics && topics > 5) {
	topics = 5;
} else if (topics && topics < 1) {
	topics = 1;
}
if (publications && publications > 1000) {
	publications = 1000;
} else if (publications && publications < 1) {
	publications = 1;
}
if (subscribers && topics && publications && pubType) {
	console.log('Initializing.....');
	totalMessagesInExperiment = publications * topics;
	initEval(subscribers, eval_sub_seq, topics, pubType, publications)
}
