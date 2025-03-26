const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();

// Clearly configured CORS for your frontend URL
app.use(cors({
  origin: "https://dashing-frangipane-bfa8fa.netlify.app",
  methods: ["GET", "POST"],
  credentials: true
}));

const server = http.createServer(app);

// Socket.IO CORS settings clearly matching frontend
const io = new Server(server, {
  cors: {
    origin: "https://dashing-frangipane-bfa8fa.netlify.app",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Coinbase API (No strict rate limits)
setInterval(async () => {
  try {
    const { data } = await axios.get('https://api.coinbase.com/v2/prices/spot?currency=USD');
    io.emit('btc-price', data.data.amount);
  } catch (err) {
    console.error('Error fetching Coinbase data:', err.message);
  }
}, 5000);

// Socket.io Connections
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('prediction', data => {
    console.log('Prediction received:', data);
    // Add logic here for prediction battles & saving winners
  });

  socket.on('disconnect', () => console.log('Player disconnected:', socket.id));
});

server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
