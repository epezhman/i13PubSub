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
	OPENWHISK_NAMESPACE : secrets.OPENWHISK_NAMESPACE,

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
	},
	FUNCTION_SUB: {
		sub_type: 'text_analyze',
		matching_input: "a,",
		matching_pub: 3,
		matching_function : "return (parseInt(a) + 2) === 5"
	}
};
