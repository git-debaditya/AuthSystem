//app entry point

//everything depends on "process.env"
require("dotenv").config();  //load env variables first
console.log("Port being used: ", process.env.PORT);  //debug print

//require necessary packages
const express = require('express');                      //web framework
const cors = require('cors');                           //enables Cross-Origin Resource Sharing
const helmet = require('helmet');                      //sets sane security-related HTTP headers
const cookieParser = require('cookie-parser');        //parses cookies from HTTP requests
const session = require('express-session');          //chosen auth mechanism
const rateLimit = require('express-rate-limit');    //brute-force or prevent credential stuffing
const authRouter = require('./routes/auth.js');       //import auth routes

//import database and redis modules
const { test_db_connection } = require('./db');                          //PostGres module
const { redisClient, test_redis_connection } = require('./redis');      //Redis module
const connectRedis = require("connect-redis");                   //connect-redis module
const RedisStore = connectRedis.RedisStore || connectRedis.default || connectRedis;    //gurantees RedisStore becomes actual constructor

//create express app
const app = express();      //main app object

//Security + Parsing middlewares
//Order matters: security + parsing before routing
app.use(helmet());                     //set secure HTTP headers
app.use(express.json());              //parse JSON bodies
app.use(cookieParser());             //parse cookies

//Cookie based auth requires credentials
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(origin => origin.trim());

app.use(
    cors({
        origin: allowedOrigins, //allow only specified origins
        credentials: true,
    })
);

//Rate Limiter
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // limit each IP to 100 requests per windowMs
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

const port = Number(process.env.PORT || 4000);

(async () => {
    try {
        await test_redis_connection();
        app.listen(port, () => {
            console.error(`API running on http://localhost:${port}/health`);
        });
    } catch (err) {
        console.error(`Startup error:`, err);
        process.exit(1);
    }
})();

//Mount auth routes at /auth
app.use("/auth", authRouter);