'use strict';

const {ipcRenderer} = require('electron');

let openPublisher;
let openSubscriber;
let openEvaluation;

$(document).ready(() => {
	openPublisher = $('#open-publisher');
	openSubscriber = $('#open-subscriber');
	openEvaluation = $('#open-evaluation');

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
});
