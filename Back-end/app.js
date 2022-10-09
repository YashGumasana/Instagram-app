import dotenv from 'dotenv';
dotenv.config();
import 'express-async-errors';
import cookieParser from 'cookie-parser';

import cors from 'cors';

//extra import


//Connect DB
import connectDB from './db/connect.js';

//socket
// import cors from 'cors';
// import http1 from 'http';
// const http = http1.createServer(app);
// import Server from 'socket.io'
// const io = new Server(http);

import SocketServer from './socketServer.js'


import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
// const server = http.createServer(app);
import { Server } from 'socket.io';
// const socketio = new Server(server);
const socketio = new Server(server);

socketio.on('connection', (socket) => {
    console.log('..');
    SocketServer(socket)
});

// Create peer server
import { ExpressPeerServer } from 'peer';
ExpressPeerServer(server, { path: '/' });


app.use(express.json());
app.use(cors())
app.use(cookieParser(process.env.JWT_SECRET))

//routers
import authRouter from './routes/auth_r.js'
import userRouter from './routes/user_r.js'
import postRouter from './routes/post_r.js'
import commentRouter from './routes/comment_r.js'
import notifyRouter from './routes/notify_r.js'
import msgRouter from './routes/message_r.js'

//error handler
import notFound from './middleware/not-found.js';
import errorHandlerMiddleware from './middleware/error-handler.js';



//routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1', postRouter);
app.use('/api/v1', commentRouter);
app.use('/api/v1', notifyRouter);
app.use('/api/v1', msgRouter);


app.use(notFound);
app.use(errorHandlerMiddleware);

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static('client/build'))
//     app.get('*', (req, res) => {
//         res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
//     })
// }

const port = 5000;

const start = async () => {

    try {
        await connectDB(process.env.MONGO_URI);
        server.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
}

start();