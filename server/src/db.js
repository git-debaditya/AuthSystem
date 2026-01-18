//PostGres connection module

const { Pool } = require('pg');
const pool = new Pool({
    //Read connection fields from process.env
    host: process.env.PGHOST,
    //Convert port to a number so Node doesn’t treat it as a string.
    port:Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
});

async function test_db_connection() {
    const res =  await pool.query('SELECT NOW() as now;');
    return res.rows[0].now;
}

module.exports = {pool, test_db_connection};

//Pool is efficient as it reuses DB connections.