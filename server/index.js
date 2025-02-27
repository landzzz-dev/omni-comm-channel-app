import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//! *********** SOCKET.IO ***********
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Change this to your frontend URL for security
        methods: ["GET", "POST"]
    }
});

//! *********** MIDDLEWARE ***********
app.use(cors());
app.use(helmet());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

//! *********** API ROUTE ***********
import Email from './src/controllers/email.js';
import SMS from './src/controllers/sms.js';
import Chat from './src/controllers/chat.js';
import Call from './src/controllers/call.js';
import Token from './src/tokens/token.js';

app.use('/api', Email);
app.use('/api', SMS(io));
app.use('/api', Chat(io));
app.use('/api', Token);
// app.use('/api', Call);
app.use('/api', Call(io));

//! *********** SERVER ***********
server.listen(port, () => {
    console.log(`Server is running on: http://localhost:${port}`);
});
