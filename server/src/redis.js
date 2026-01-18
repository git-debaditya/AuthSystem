//Redis connection module

//Imports a function to create a Redis client from the redis package
const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

//Error Listener
redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
});

async function test_redis_connection() {
    if (!redisClient.isOpen) {  //check if client is connected
        await redisClient.connect();    //if client not connected, connect it
    }
    await redisClient.ping();   //ping command to test connection
    return true;    //if ping successful, return true
}

module.exports = {redisClient, test_redis_connection};

//Redis is your session store. If it’s down, authentication is dead.