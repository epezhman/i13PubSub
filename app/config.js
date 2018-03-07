'use strict';

const secrets = require('./secrets.config');
const appPackage = require('./package.json');

const APP_SHORT_NAME = appPackage.name;
const APP_NAME = appPackage.productName;
const APP_VERSION = appPackage.version;
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const IS_WINDOWS = process.platform === 'win32';
const IS_LINUX = process.platform === 'linux';

module.exports = {
	APP_COPYRIGHT: 'Copyright © 2018 ' + APP_NAME,
	APP_SHORT_NAME: APP_SHORT_NAME,
	APP_NAME: APP_NAME,
	APP_VERSION: APP_VERSION,
	IS_WINDOWS: IS_WINDOWS,
	IS_LINUX: IS_LINUX,
	IS_DEVELOPMENT: IS_DEVELOPMENT,

	SUBSCRIBE_TOPIC_URL: secrets.SUBSCRIBE_TOPIC_URL,
	UNSUBSCRIBE_TOPIC_URL: secrets.UNSUBSCRIBE_TOPIC_URL,
	SUBSCRIBE_PREDICATES_URL: secrets.SUBSCRIBE_PREDICATES_URL,
	SUBSCRIBE_FUNCTION_URL: secrets.SUBSCRIBE_FUNCTION_URL,
	UNSUBSCRIBE_FUNCTION_URL: secrets.UNSUBSCRIBE_FUNCTION_URL,
	REGISTER_SUBSCRIBER_URL: secrets.REGISTER_SUBSCRIBER_URL,
	WATSON_IOT_REGISTER_URL: secrets.WATSON_IOT_REGISTER_URL,
	PUBLISH_TOPIC_BASED_URL: secrets.PUBLISH_TOPIC_BASED_URL,
	PUBLISH_CONTENT_BASED_URL: secrets.PUBLISH_CONTENT_BASED_URL,
	PUBLISH_FUNCTION_BASED_URL: secrets.PUBLISH_FUNCTION_BASED_URL,
	BULK_SUBSCRIBE_PREDICATES_URL: secrets.BULK_SUBSCRIBE_PREDICATES_URL,
	BULK_SUBSCRIBE_TOPICS_URL: secrets.BULK_SUBSCRIBE_TOPICS_URL,
	BULK_SUBSCRIBE_FUNCTIONS_URL: secrets.BULK_SUBSCRIBE_FUNCTIONS_URL,

	OPENWHISK_API_KEY: secrets.OPENWHISK_API_KEY,
	OPENWHISK_API_HOST: secrets.OPENWHISK_API_HOST,
	OPENWHISK_NAMESPACE: secrets.OPENWHISK_NAMESPACE,

	WATSON_IOT_REGISTER_PASSWORD: secrets.WATSON_IOT_REGISTER_PASSWORD,
	WATSON_IOT_API_USERNAME: secrets.WATSON_IOT_API_USERNAME,
	WATSON_IOT_API_PASSWORD: secrets.WATSON_IOT_API_PASSWORD,
	WATSON_IOT_ORG: secrets.WATSON_IOT_ORG,
	WATSON_IOT_DEVICE_TYPE: secrets.WATSON_IOT_DEVICE_TYPE,

	SUBSCRIBERS: secrets.SUBSCRIBERS,
	MAX_NUMBER_SUBSCRIBER: 1000,
	MAX_NUMBER_MESSAGES: 100,
	PUBLICATION_DATA: 'Lorem ipsum dolor sit amet , consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.',
	TOPICS: ['evaluation_1', 'evaluation_2', 'evaluation_3', 'evaluation_4', 'evaluation_5'],
	SUB_PREDICATES: {
		conference_1: {
			value: 'debs',
			operator: '='
		},
		attendance_1: {
			value: '1000',
			operator: '>='
		},
	},
	PUB_PREDICATE: {
		conference_1: 'debs',
		attendance_1: 5000
	},
	FUNCTION_SUB: {
		sub_type: 'text_analyze',
		matching_input: "publication,",
		matching_pub: 'DEBS2018 will be held at the University of Waikato in New Zealand.',
		matching_function: "let populations = {'new zealand': 4693000, 'germany': 8267000}; let sentence = nlp(publication); let places = sentence.places().out('array'); return populations[places[0]] > 4000000;"
	},
	EVAL_TOPICS: 1,
	EVAL_NODE_COUNT: 4,
	EVALS: {
		e11: {
			sub_count: 100,
			pub_count: 10,
			latency: 100
		},
		e12: {
			sub_count: 150,
			pub_count: 10,
			latency: 100
		},
		e13: {
			sub_count: 200,
			pub_count: 10,
			latency: 100
		},
		e14: {
			sub_count: 250,
			pub_count: 10,
			latency: 100
		},
		e15: {
			sub_count: 300,
			pub_count: 10,
			latency: 100
		},
		e21: {
			sub_count: 100,
			pub_count: 25,
			latency: 40
		},
		e22: {
			sub_count: 150,
			pub_count: 25,
			latency: 40
		},
		e23: {
			sub_count: 200,
			pub_count: 25,
			latency: 40
		},
		e24: {
			sub_count: 250,
			pub_count: 25,
			latency: 40
		},
		e25: {
			sub_count: 300,
			pub_count: 25,
			latency: 40
		},
		e31: {
			sub_count: 100,
			pub_count: 40,
			latency: 25
		},
		e32: {
			sub_count: 150,
			pub_count: 40,
			latency: 25
		},
		e33: {
			sub_count: 200,
			pub_count: 40,
			latency: 25
		},
		e34: {
			sub_count: 250,
			pub_count: 40,
			latency: 25
		},
		e35: {
			sub_count: 300,
			pub_count: 40,
			latency: 25
		},
	}
};
