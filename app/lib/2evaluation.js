'use strict';

const eachSeries = require('async/eachSeries');
const config = require('../config');
const openwhisk = require('openwhisk');

const openWhiskOptions = {
	apihost: config.OPENWHISK_API_HOST,
	api_key: config.OPENWHISK_API_KEY
};

let ows = openwhisk(openWhiskOptions);

let finishedSuccessfully = false;
let experimentLogs = {};
let subCounter = 0;
let doneCounter = 0;
let sumTime = 0;
let totalGotMessageCounter = 0;
let totalMessagesInExperiment = 0;

let eval_inputs = process.argv.slice(2);

let eval_type = eval_inputs[0]; // t for topic, c for content, f for function
let eval_cofig = config.EVALS[eval_inputs[1]]; // e11 ...

let publications = eval_cofig['pub_count'];
let delays = config.EVAL_DELAY;
let topics = config.EVAL_TOPICS;

function publishMessages(publicationsCount, delayMS) {
	resetValues();
	finishedSuccessfully = false;
	console.log('Performing Evaluation....');
	let startTime = Date.now();
	let publications = Array.apply(null, {length: publicationsCount}).map(Number.call, Number);
	let meta = null;
	if (eval_type === 'c') {
		meta = JSON.stringify(config.PUB_PREDICATE);
	}
	else if (eval_type === 't') {
		meta = config.TOPICS.slice(0, topics).toString();
	}
	else if (eval_type === 'f') {
		meta = config.FUNCTION_SUB;
	}
	eachSeries(publications, (counter, cb) => {
		if (eval_type === 't') {
			publishTopicsBased(meta, config.PUBLICATION_DATA, delayMS, cb);
		}
		else if (eval_type === 'c') {
			publishContentsBased(meta, config.PUBLICATION_DATA, delayMS, cb);
		}
		else if (eval_type === 'f') {
			publishFunctionBased(meta, delayMS, cb);
		}
		console.log("Message Sent: " + (counter + 1));
	}, (err) => {
		if (err) {
			console.log(err)
		}
		console.log("Total Publication Time: " + (Date.now() - startTime));
	});
}

function publishTopicsBased(topics, message, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish_topic_based_1",
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

function publishContentsBased(predicates, message, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish_content_based_1",
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

function publishFunctionBased(meta, delayMs, cb) {
	ows.actions.invoke({
		name: "pubsub/publish_function_based_1",
		blocking: true,
		result: true,
		params: {
			sub_type: meta['sub_type'],
			matching_input: meta['matching_input'],
			matching_function: meta['matching_function'],
			message: meta['matching_pub']
		}
	}).then(result => {
		setTimeout(cb, delayMs);
	}).catch(err => {
		console.error(err)
	});
}

function resetValues() {
	sumTime = 0;
	doneCounter = 0;
	totalGotMessageCounter = 0;
	for (let sub in experimentLogs) {
		if (experimentLogs.hasOwnProperty(sub)) {
			experimentLogs[sub]['subCounter'] = 0;
		}
	}
}

if (publications && publications > 1000) {
	publications = 1000;
} else if (publications && publications < 1) {
	publications = 1;
}
if (delays && delays < 0) {
	delays = 0;
}
if (publications && delays >= 0) {
	totalMessagesInExperiment = publications * topics;
	publishMessages(publications, delays)
}
