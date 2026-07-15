import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true, // включает строгий режим React.
    // Прокси для WebSocket не нужен, так как мы используем отдельный порт
    // Для продакшена можно настроить переопределение переменных окружения
    env: {
        // Передаём переменные на клиент через NEXT_PUBLIC_...
        NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    },
};

export default nextConfig;