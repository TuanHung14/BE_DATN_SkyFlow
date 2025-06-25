const socketIO = require('socket.io');
const { handleSocketEvents } = require('../controller/socketController');

const initializeSocket = (server) => {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', async (socket) => {
        console.log('A user connected:', socket.id);
        await handleSocketEvents(io, socket);
    });
};

module.exports = initializeSocket;