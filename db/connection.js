const { Pool } = require('pg');
const redis = require('redis');

const env = process.env.NODE_ENV;

switch (env) {
    case 'dev':
        module.exports = {
            pgPool: new Pool({
                host: 'localhost',
                user: 'wangbo',
                password: null,
                database: 'ibot',
                port: 5432
            }),
            redisClient: redis.createClient ({
                host: 'localhost',
                port: 6379,
            })
        };
        break;
    case 'prod':
        module.exports = {
            pgPool: new Pool({
                host: 'localhost',
                user: 'ec2-user',
                password: null,
                database: 'ibot',
                port: 5432
            }),
            // redisClient: redis.createClient ({
            //     host: 'localhost',
            //     port: 6379,
            // })
        };
        break
}
