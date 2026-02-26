import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        const redisPort = parseInt(process.env.REDIS_PORT || '6379');
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const useTls = process.env.REDIS_TLS === 'true' || redisPort === 6380 || (redisUrl && redisUrl.startsWith('rediss://'));

        console.log(`[RedisService] Connecting via ${redisUrl ? 'URL' : 'Host:Port'}. TLS: ${useTls}`);

        const config: any = redisUrl ? { url: redisUrl } : {
            host: redisHost,
            port: redisPort,
            password: process.env.REDIS_PASSWORD,
        };

        if (useTls) {
            config.tls = { rejectUnauthorized: false };
        }

        this.client = redisUrl ? new Redis(redisUrl, config) : new Redis(config);

        this.client.on('error', (err) => console.error('[Redis Service Error]', err));
        this.client.on('connect', () => console.log('[Redis Service] Connected to Redis'));
    }

    onModuleDestroy() {
        this.client.disconnect();
    }

    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }
}
