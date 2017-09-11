'use strict';

const subscriber = require('./subscribe');
const eachLimit = require('async/eachLimit');
const eachSeries = require('async/eachSeries');

const config = require('../config');

let counter = 0;

eachSeries([config.TOPICS_1, config.TOPICS_2, config.TOPICS_3, config.TOPICS_4, config.TOPICS_5], (topics, cb_outer) => {
	eachLimit(topics, 1, (topic, cb1) => {
		eachLimit(config.SUBSCRIBERS, 1, function (sub_id, cb2) {
			counter += 1;
			console.log(`${counter}. Removing Topic ${topic} to ${sub_id}`);
			subscriber.unsubscribe(topic, sub_id, cb2);
		}, function (err) {
			if (err) {
				console.log(err)
			}
			else {
				cb1();
			}
		});
	}, (err) => {
		if (err) {
			console.log(err)
		}
		else {
			cb_outer()
		}
	});
}, (err) => {
	if (err) {
		console.log(err);
	}
});
