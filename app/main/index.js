'use strict';
const electron = require('electron');


const app = electron.app;

// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();

// Prevent window being garbage collected
let publishWindow;
let subscribeWindow;
let chatWindow;
let chatRoomWindow;

function onClosedPublish() {
	publishWindow = null;
}

function createPublishWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Publisher",
		icon: "../assets/img/p.png",
		useContentSize: true,
		width: 800,
		height: 500,
		x: 0,
		y: 0
	});

	win.loadURL(`file://${__dirname}/../renderer/publish.html`);
	win.on('closed', onClosedPublish);

	return win;
}

function onClosedSubscribe() {
	subscribeWindow = null;
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
	win.on('closed', onClosedSubscribe);

	return win;
}

function onClosedChatRoom() {
	chatRoomWindow = null;
}

function createChatRoomWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Serverless Chat Room",
		icon: "../assets/img/p.png",
		useContentSize: true,
		width: 400,
		height: 600,
		x: 0,
		y: 0
	});

	win.loadURL(`file://${__dirname}/../renderer/chat-room.html`);
	win.on('closed', onClosedChat);

	return win;
}

function onClosedChat() {
	chatWindow = null;
}

function createChatWindow() {
	const win = new electron.BrowserWindow({
		backgroundColor: '#ECECEC',
		center: true,
		title: "i13 Serverless Chat",
		icon: "../assets/img/p.png",
		useContentSize: true,
		width: 400,
		height: 600,
		x: 950,
		y: 0
	});

	win.loadURL(`file://${__dirname}/../renderer/chat.html`);
	win.on('closed', onClosedChat);

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
	if (!publishWindow) {
		publishWindow = createPublishWindow();
	}
	if (!subscribeWindow) {
		subscribeWindow = createSubscribeWindow();
	}
});

app.on('ready', () => {
	// chatWindow = createChatWindow();
	// chatRoomWindow = createChatRoomWindow();
	publishWindow = createPublishWindow();
	subscribeWindow = createSubscribeWindow();
});
