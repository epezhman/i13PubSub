'use strict';

module.exports.initSubscribers = initSubscribers;
module.exports.resetValues = resetValues;

const Client = require("ibmiotf");
const config = require('../config');
const eachLimit = require('async/eachLimit');

let devices = {};
let experimentLogs = {};
let subCounter = 0;
let doneCounter = 0;
let sumTime = 0;

function initSubscribers(subCount, pubCount, topicsCount) {
	return new Promise((resolve, reject) => {
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
	});
}


