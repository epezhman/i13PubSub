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
	APP_COPYRIGHT: 'Copyright © 2017 ' + APP_NAME,
	APP_SHORT_NAME: APP_SHORT_NAME,
	APP_NAME: APP_NAME,
	APP_VERSION: APP_VERSION,
	IS_WINDOWS: IS_WINDOWS,
	IS_LINUX: IS_LINUX,
	IS_DEVELOPMENT: IS_DEVELOPMENT,

	PUBLISH_URL: secrets.PUBLISH_URL,
	PUBLISH_STATELESS_URL: secrets.PUBLISH_STATELESS_URL,
	PUBLISH_CONTENT_BASED_URL: secrets.PUBLISH_CONTENT_BASED_URL,
	SUBSCRIBE_URL: secrets.SUBSCRIBE_URL,
	SUBSCRIBE_PREDICATES_URL: secrets.SUBSCRIBE_PREDICATES_URL,
	BULK_SUBSCRIBE_PREDICATES_URL: secrets.BULK_SUBSCRIBE_PREDICATES_URL,
	BULK_SUBSCRIBE_URL: secrets.BULK_SUBSCRIBE_URL,
	SUBSCRIBE_LAST_SEEN_URL: secrets.SUBSCRIBE_LAST_SEEN_URL,
	UNSUBSCRIBE_URL: secrets.UNSUBSCRIBE_URL,
	GET_TOPICS_URL: secrets.GET_TOPICS_URL,
	GET_MESSAGES_URL: secrets.GET_MESSAGES_URL,
	REGISTER_SUBSCRIBER_URL: secrets.REGISTER_SUBSCRIBER_URL,
	WATSON_IOT_REGISTER_URL: secrets.WATSON_IOT_REGISTER_URL,

	WATSON_IOT_REGISTER_PASSWORD: secrets.WATSON_IOT_REGISTER_PASSWORD,
	WATSON_IOT_API_USERNAME: secrets.WATSON_IOT_API_USERNAME,
	WATSON_IOT_API_PASSWORD: secrets.WATSON_IOT_API_PASSWORD,
	WATSON_IOT_ORG: secrets.WATSON_IOT_ORG,
	WATSON_IOT_DEVICE_TYPE: secrets.WATSON_IOT_DEVICE_TYPE,

	SUBSCRIBERS: secrets.SUBSCRIBERS,
	MAX_NUMBER_SUBSCRIBER: 1000,
	MAX_NUMBER_MESSAGES: 100,
	TOPICS: ['evaluation_1', 'evaluation_2', 'evaluation_3', 'evaluation_4', 'evaluation_5'],
	SUB_PREDICATES: {
		type_1: {
			value: 'news',
			operator: '='
		},
		popularity_1: {
			value: '200',
			operator: '>='
		},
	},
	PUB_PREDICATE: {
		type_1: 'news',
		popularity_1: 300
	}
};
