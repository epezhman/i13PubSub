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


let devices = {};
let experimentLogs = {};
let subCounter = 0;
let doneCounter = 0;
let sumTime = 0;
let totalGotMessageCounter = 0;
let totalMessagesInExperiment = 0;
let firstMessageEver = true;

let eval_inputs = process.argv.slice(2);

let eval_type = eval_inputs[0]; // t for topic, c for content, f for function
let eval_cofig = config.EVALS[eval_inputs[1]]; // e11 ...
let eval_sub_seq = eval_inputs[2]; // 0, 1, 2, 3 ...

let subscribers = eval_cofig['sub_count'] / config.EVAL_NODE_COUNT;
let all_subscribers = eval_cofig['sub_count'];
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
				if (firstMessageEver) {
					firstMessageEver = false;
					console.log('\x1b[33m%s\x1b[0m', "Start Receiving Messages.....");
				}
				 console.log('Got ' + totalGotMessageCounter);
				if (experimentLogs[sub_id]['subCounter'] === 1) {
					experimentLogs[sub_id]['subStartTimestamp'] = Date.now();
				}
				else if (experimentLogs[sub_id]['subCounter'] === totalMessagesInExperiment) {
					experimentLogs[sub_id]['subEndTimestamp'] = Date.now();
					sumTime += (experimentLogs[sub_id]['subEndTimestamp'] - experimentLogs[sub_id]['subStartTimestamp']);
					doneCounter += 1;
					if (doneCounter === subCounter) {
						console.log("Number of messages received: " + (totalMessagesInExperiment * doneCounter));
						console.log('\x1b[36m%s\x1b[0m', "Average Message Latency: " + Math.round(sumTime / doneCounter));
						resetExperimentValue();
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

function resetExperimentValue() {
	sumTime = 0;
	totalGotMessageCounter = 0;
	doneCounter = 0;
	firstMessageEver = true;
	for (let sub_id in experimentLogs) {
		if (experimentLogs.hasOwnProperty(sub_id)) {
			experimentLogs[sub_id]['subCounter'] = 0;
		}
	}
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

function initEval(all_subscribers, subscribers, subscribers_seq, topics, pubType, publications) {
	if (pubType === 't') {
		if (subscribers_seq === '0') {
			ows.actions.invoke({
				name: "pubsub/bulk_subscribe_topics",
				blocking: true,
				result: true,
				params: {
					topics: config.TOPICS.slice(0, topics).toString(),
					subscribes: config.SUBSCRIBERS.slice(0, all_subscribers).toString()
				}
			}).then(result => {
				resetPrepareDevices(subscribers, subscribers_seq);
			}).catch(err => {
				console.error(err)
			});
		}
		else {
			resetPrepareDevices(subscribers, subscribers_seq);
		}

	} else if (pubType === 'c') {
		if (subscribers_seq === '0') {
			ows.actions.invoke({
				name: "pubsub/bulk_subscribe_predicates",
				blocking: true,
				result: true,
				params: {
					predicates: JSON.stringify(config.SUB_PREDICATES),
					subscribes: config.SUBSCRIBERS.slice(0, all_subscribers).toString()
				}
			}).then(result => {
				resetPrepareDevices(subscribers, subscribers_seq);
			}).catch(err => {
				console.error(err)
			});
		}
		else {
			resetPrepareDevices(subscribers, subscribers_seq);
		}
	}
	else if (pubType === 'f') {
		if (subscribers_seq === '0') {
			ows.actions.invoke({
				name: "pubsub/bulk_subscribe_function",
				blocking: true,
				result: true,
				params: {
					sub_type: config.FUNCTION_SUB.sub_type,
					matching_input: config.FUNCTION_SUB.matching_input,
					matching_function: config.FUNCTION_SUB.matching_function,
					subscribers: config.SUBSCRIBERS.slice(0, all_subscribers).toString()
				}
			}).then(result => {
				resetPrepareDevices(subscribers, subscribers_seq);
			}).catch(err => {
				console.error(err)
			});
		}
		else {
			resetPrepareDevices(subscribers, subscribers_seq);
		}
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
	initEval(all_subscribers, subscribers, eval_sub_seq, topics, pubType, publications)
}
