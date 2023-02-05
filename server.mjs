import express from 'express';
import http from 'http';
import {Server as ioServer } from 'socket.io';
import cors from 'cors';

import path from 'path';

const PORT = process.env.PORT || 3300;


const app = express();

app.use(cors());

const server = http.createServer(app);

const socketServer = new ioServer(server, {
	cors: {
		origin: "*",
	}
});

import Chat from './chat.mjs';

const users = [];

socketServer.on('connection', (socket) => {
	const chat = new Chat(socket, users);

	chat.bindFetch();
	chat.unBindFetch();
	chat.bindAddMessage();
	chat.bindCreateUsername();
	chat.bindUpdateUsername();
});

app.use('/', express.static(path.resolve() + "/../client/build"));

server.listen(PORT, () => {
	console.log(`Streaming service is running on http://localhost:${PORT}`);
});
