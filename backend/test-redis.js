
const Redis = require('ioredis');
require('dotenv').config();

const port = process.env.REDIS_PORT || 6379;
const host = process.env.REDIS_HOST || 'localhost';
const password = process.env.REDIS_PASSWORD;

console.log(`Testing Redis connection to ${host}:${port}...`);

async function testConnection(useTls) {
    console.log(`\n--- Testing with TLS: ${useTls} ---`);
    const redis = new Redis({
        host,
        port,
        password,
        tls: useTls ? { rejectUnauthorized: false } : undefined,
        retryStrategy: () => null, // Don't retry
        connectTimeout: 5000
    });

    try {
        await redis.ping();
        console.log(`SUCCESS: Connected with TLS=${useTls}`);
        await redis.quit();
        return true;
    } catch (err) {
        console.error(`FAILED: TLS=${useTls}. Error:`, err.message);
        if (err.message.includes('packet length too long') || err.message.includes('WRONG_VERSION_NUMBER')) {
            console.log('HINT: This error usually means the client sent a TLS handshake to a non-TLS port.');
        }
        return false;
    }
}

async function run() {
    await testConnection(false);
    await testConnection(true);
}

run();
