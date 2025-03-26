const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// BTC Price broadcast every 5 seconds
setInterval(async () => {
  const { data } = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
  io.emit('btc-price', data.bitcoin.usd);
}, 5000);

// Socket.io Connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('prediction', data => {
    console.log('Prediction received:', data);
    // Here you’ll add logic to handle prediction battles & save winners
  });

  socket.on('disconnect', () => console.log('Player disconnected:', socket.id));
});

server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
