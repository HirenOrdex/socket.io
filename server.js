// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH"],
        credentials: true // Allow credentials
    }
});

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(bodyParser.json());

let data = [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }];

app.get('/api/data', (req, res) => {
    res.json(data);
});

app.patch('/api/update', (req, res) => {
    const { id, name } = req.body;
    data = data.map(item => item.id === id ? { ...item, name } : item);
    io.emit('refreshData', data); // Emit updated data
    res.send('Data updated');
});

app.post('/api/add', (req, res) => {
    const { name } = req.body;
    const newItem = { id: data.length + 1, name };
    data.push(newItem);
    res.send('Item added');
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
