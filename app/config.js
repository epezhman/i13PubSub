'use strict';

const secrets = require('./secrets.config')


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
	SUBSCRIBE_URL: secrets.SUBSCRIBE_URL,
	UNSUBSCRIBE_URL: secrets.UNSUBSCRIBE_URL,
	GET_TOPICS_URL: secrets.GET_TOPICS_URL,
	GET_MESSAGES_URL: secrets.GET_MESSAGES_URL,
	REGISTER_SUBSCRIBER_URL: secrets.REGISTER_SUBSCRIBER_URL
};
