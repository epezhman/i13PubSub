'use strict';

const {ipcRenderer} = require('electron');

let openPublisher;
let openSubscriber;
let openEvaluation;
let registerIOT;

$(document).ready(() => {
	openPublisher = $('#open-publisher');
	openSubscriber = $('#open-subscriber');
	openEvaluation = $('#open-evaluation');
	registerIOT = $('#bulk-register-iot');

	openPublisher.click((e) => {
		e.preventDefault();
		ipcRenderer.send('open-publisher', 'open');
	});

	openSubscriber.click((e) => {
		e.preventDefault();
		ipcRenderer.send('open-subscriber', 'open');
	});

	openEvaluation.click((e) => {
		e.preventDefault();
		ipcRenderer.send('open-evaluation', 'open');
	});

	registerIOT.click((e) => {
		e.preventDefault();
		ipcRenderer.send('register-iots', 'register');
	});
});
