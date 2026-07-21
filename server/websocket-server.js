// server/websocket-server.js
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '../lib/prisma.js';

dotenv.config();

const WS_PORT = process.env.WS_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// ---- Клиенты WebSocket ----
const clients = new Set();

// ---- Парсинг токена из URL ----
function getTokenFromUrl(url) {
    const parsedUrl = new URL(url, `http://localhost:${WS_PORT}`);
    return parsedUrl.searchParams.get('token');
}

// ---- Генератор ID (временный, пока используем) ----
let idCounter = 1000;
function generateId() {
    return `item-${idCounter++}`;
}

// ---- Создание WebSocket-сервера ----
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', async (ws, req) => {
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


    // ---- Отправляем все уведомления пользователя из БД ----
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });
        ws.send(JSON.stringify({ type: 'init', payload: notifications }));
    } catch (err) {
        console.error('❌ Failed to fetch notifications:', err);
        ws.close(1011, 'Internal Server Error');
        return;
    }

    // ---- Обработка сообщений от клиента ----
    ws.on('message', async (message) => {
        console.log('📩 Получено от клиента:', message.toString());
        // Здесь можно обработать команды от клиента (например, пометить как прочитанное)
    });

    ws.on('close', () => {
        console.log('🔴 Клиент отключился');
        clients.delete(ws);
    });

    ws.on('error', (err) => {
        console.error('❌ WebSocket error:', err);
    });
});

// ---- Эмуляция новых уведомлений (каждые 10 секунд) ----
setInterval(async () => {
    // Генерируем новое уведомление для каждого подключённого пользователя
    // В реальном проекте уведомления могут приходить из внешнего источника
    for (const client of clients) {
        if (client.readyState !== 1) continue; // WebSocket.OPEN = 1

        const user = client.user;
        if (!user) continue;

        const newItem = {
            id: generateId(),
            text: `Item ${Date.now()}`,
        };

        try {
            // Сохраняем в БД
            await prisma.notification.create({
                data: {
                    id: newItem.id,
                    text: newItem.text,
                    userId: user.id,
                    isNew: true,
                },
            });

            // Отправляем клиенту
            client.send(JSON.stringify({
                type: 'update',
                payload: [newItem],
            }));
            console.log(`📤 Отправлено обновление: ${newItem.text} (id: ${newItem.id})`);
        } catch (err) {
            console.error('❌ Failed to create notification:', err);
        }
    }
}, 10000);

console.log(`✅ WebSocket server running on port ${WS_PORT}`);