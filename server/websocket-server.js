// server/websocket-server.js
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const WS_PORT = process.env.WS_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ---- In-memory хранилище уведомлений ----
let dataStore = {
    items: [
        { id: 'init-1', text: 'Initial item 1' },
        { id: 'init-2', text: 'Initial item 2' },
    ],
    lastUpdate: Date.now(),
};
let idCounter = 3;

function generateId() {
    return `item-${idCounter++}`;
}

// ---- Клиенты WebSocket ----
const clients = new Set();

// ---- Парсинг токена из URL ----
function getTokenFromUrl(url) {
    const parsedUrl = new URL(url, `http://localhost:${WS_PORT}`);
    return parsedUrl.searchParams.get('token');
}

// ---- Создание WebSocket-сервера ----
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws, req) => {
    const token = getTokenFromUrl(req.url);
    if (!token) {
        ws.close(1008, 'Unauthorized');
        return;
    }

    let user;
    try {
        user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        ws.close(1008, 'Unauthorized');
        return;
    }

    console.log(`✅ User ${user.username} connected`);
    ws.user = user;
    clients.add(ws);

    ws.on('message', (message) => {
        console.log('📩 Получено от клиента:', message.toString());
    });

    ws.on('close', () => {
        console.log('🔴 Клиент отключился');
        clients.delete(ws);
    });

    ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
    });
});

// ---- Эмуляция новых уведомлений ----
setInterval(() => {
    const newItem = {
        id: generateId(),
        text: `Item ${Date.now()}`,
    };
    dataStore.items.push(newItem);
    dataStore.lastUpdate = Date.now();

    const payload = JSON.stringify({
        type: 'update',
        payload: [newItem],
    });

    for (const client of clients) {
        if (client.readyState === 1) { // WebSocket.OPEN = 1
            client.send(payload);
        }
    }
    console.log(`📤 Отправлено обновление: ${newItem.text} (id: ${newItem.id})`);
}, 10000);

console.log(`✅ WebSocket server running on port ${WS_PORT}`);