import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;
    private isReady: boolean = false;

    onModuleInit() {
        const redisUrl = process.env.REDIS_URL;
        const redisPort = parseInt(process.env.REDIS_PORT || '6379');
        const redisHost = process.env.REDIS_HOST || 'localhost';
        const useTls = process.env.REDIS_TLS === 'true' || redisPort === 6380 || (redisUrl && redisUrl.startsWith('rediss://'));

        console.log(`[RedisService] Initializing connection. TLS: ${useTls}`);

        const config: any = redisUrl ? { url: redisUrl } : {
            host: redisHost,
            port: redisPort,
            password: process.env.REDIS_PASSWORD || undefined,
            maxRetriesPerRequest: 3,
            retryStrategy(times: number) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        };

        if (useTls) {
            config.tls = { rejectUnauthorized: false };
        }

        try {
            this.client = redisUrl ? new Redis(redisUrl, config) : new Redis(config);

            this.client.on('error', (err) => {
                // Silenciamos erro de conexão para não poluir logs excessivamente
                if (this.isReady) {
                    console.error('[Redis Service Error]', err.message);
                }
                this.isReady = false;
            });

            this.client.on('connect', () => {
                console.log('[Redis Service] Connected to Redis');
                this.isReady = true;
            });

            this.client.on('ready', () => {
                this.isReady = true;
            });

            this.client.on('end', () => {
                this.isReady = false;
            });
        } catch (e) {
            console.error('[Redis Service] critical initialization error', e);
        }
    }

    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }

    async get(key: string): Promise<string | null> {
        if (!this.isReady) return null;
        try {
            return await this.client.get(key);
        } catch (e) {
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (!this.isReady) return;
        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            } else {
                await this.client.set(key, value);
            }
        } catch (e) {
            // Silently fail for cache
        }
    }

    async del(key: string): Promise<void> {
        if (!this.isReady) return;
        try {
            await this.client.del(key);
        } catch (e) {
            // Silently fail for cache
        }
    }
}
