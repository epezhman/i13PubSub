'use strict';

const electron = require('electron');
const {ipcMain} = require('electron');

const app = electron.app;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let publishWindow;
let subscribeWindow;
let evaluationWindow;
let panelWindow;

function createPublishWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Publisher",
		icon: "../assets/img/p.png",
		useContentSize: true,
		width: 800,
		height: 700,
		x: 0,
		y: 0
	});

	win.loadURL(`file://${__dirname}/../renderer/publish.html`);
	win.on('closed', () => {
		publishWindow = null;
	});

	return win;
}

function createSubscribeWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Subscriber",
		icon: "../assets/img/s.png",
		useContentSize: true,
		width: 800,
		height: 900,
		x: 950,
		y: 0
	});

	win.loadURL(`file://${__dirname}/../renderer/subscribe.html`);
	win.on('closed', () => {
		subscribeWindow = null;
	});

	return win;
}

function createEvaluationWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Broker Evaluation",
		icon: "../assets/img/s.png",
		useContentSize: true,
		width: 800,
		height: 780,
		x: 400,
		y: 0
	});

	win.loadURL(`file://${__dirname}/../renderer/evaluation.html`);
	win.on('closed', () => {
		evaluationWindow = null;
	});

	return win;
}

function createPanelWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Broker Panel",
		icon: "../assets/img/s.png",
		useContentSize: true,
		width: 400,
		height: 180,
		x: 500,
		y: 700
	});

	win.loadURL(`file://${__dirname}/../renderer/panel.html`);
	win.on('closed', () => {
		panelWindow = null;
	});

	return win;
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('quit', () => {
});

app.on('activate', () => {
	if (!panelWindow) {
		panelWindow = createPanelWindow();
	}
});

app.on('ready', () => {
	panelWindow = createPanelWindow();
});

ipcMain.on('open-publisher', (event, arg) => {
	if (!publishWindow) {
		publishWindow = createPublishWindow();
	}
});

ipcMain.on('open-subscriber', (event, arg) => {
	if (!subscribeWindow) {
		subscribeWindow = createSubscribeWindow();
	}
});

ipcMain.on('open-evaluation', (event, arg) => {
	if (!evaluationWindow) {
		evaluationWindow = createEvaluationWindow();
	}
});
