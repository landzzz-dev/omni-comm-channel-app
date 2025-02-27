import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// const monitoring_system = knex({
//     client: 'mysql2',
//     connection: {
//         host: process.env.LOCALHOST_HOST,
//         port: process.env.LOCALHOST_PORT as any,
//         user: process.env.LOCALHOST_USER,
//         password: process.env.LOCALHOST_PASSWORD,
//         database: 'monitoring_system',
//     },
//     pool: { min: 2, max: 10 },
//     acquireConnectionTimeout: 10000,
// });

const asg = mysql.createPool({
    host: process.env.LOCALHOST_HOST,
    port: process.env.LOCALHOST_PORT,
    user: process.env.LOCALHOST_USER,
    password: process.env.LOCALHOST_PASS,
    database: 'asg',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


export { asg }