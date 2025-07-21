require('dotenv').config();

//Xử lý dừng chương trình khi có biến dư kh dùng 
process.on('uncaughtException', err => {
    console.log('Uncaught exception! Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');
const database = require('./config/db');
const http = require("http");
const initializeSocket = require("./config/socket");

// Connect to the database
database.connect();

const server = http.createServer(app);
initializeSocket(server);

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`);
    console.log(`API docs available at: http://localhost:${port}/api-docs`);
});


//Xử lý catch kh được giải quyết global nếu lỗi ở .catch nào đều dô đây
process.on('unhandledRejection', err => {
    console.log('Unhandled rejection! Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
    
});