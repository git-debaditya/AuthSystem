//app entry point

//everything depends on "process.env"
require("dotenv").config();  //load env variables first

//require necessary packages
const express = require('express');                      //web framework
const cors = require('cors');                           //enables Cross-Origin Resource Sharing
const helmet = require('helmet');                      //sets sane security-related HTTP headers
const cookieParser = require('cookie-parser');        //parses cookies from HTTP requests
const session = require('express-session');          //chosen auth mechanism
const rateLimit = require('express-rate-limit');    //brute-force or prevent credential stuffing

//import database and redis modules
const { test_db_connection } = require('./db');                          //PostGres module
const { redisClient, test_redis_connection } = require('./redis');      //Redis module
const RedisStore = require('connect-redis').default;                   //Redis session store for express-session

//create express app
const app = express();      //main app object

//Security + Parsing middlewares
//Order matters: security + parsing before routing
app.use(helmet());                     //set secure HTTP headers
app.use(express.json());              //parse JSON bodies
app.use(cookieParser());             //parse cookies

//Cookie based auth requires credentials
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

//Rate Limiter
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxLimit: 100, // limit each IP to 100 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    })
);

//Redis Session Store
app.use(
    session({
        store: new RedisStore({ client: redisClient}),
        name: "dev",    //cookie name
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true, //prevents Js accesss
            secure: false, //set to true if using https
            sameSite: "lax", //adjust based on client-server setup
            maxAge: 1000 * 60 * 60 * 24, //1 day
        },
    })
);

//Health Check Endpoint
app.get("/health", async (req, res) => {
    try{
        const now = await test_db_connection();        //test PostGres connection
        const pong = await redisClient.ping();         //test Redis connection
        res.json({ok: true, postgresTime: now, redis: pong})
    } catch (err) {
        res.status(500).json({ok: false, error: err.message});
    }
});

