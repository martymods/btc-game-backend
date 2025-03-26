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

// Store last BTC price clearly
let lastPrice = null;

// Coinbase API (No strict rate limits)
setInterval(async () => {
  try {
    const { data } = await axios.get('https://api.coinbase.com/v2/prices/spot?currency=USD');
    const btcPrice = parseFloat(data.data.amount);
    io.emit('btc-price', btcPrice);
    lastPrice = btcPrice; // Update last known price
  } catch (err) {
    console.error('Error fetching Coinbase data:', err.message);
  }
}, 5000);

// Socket.io Connections with prediction logic clearly integrated
io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('prediction', async (data) => {
    console.log('Prediction received:', data);

    // Wait clearly for the next BTC price (5 seconds)
    setTimeout(async () => {
      try {
        const { data: newData } = await axios.get('https://api.coinbase.com/v2/prices/spot?currency=USD');
        const newPrice = parseFloat(newData.data.amount);

        let result = 'lose';
        if (data.prediction === 'UP' && newPrice > lastPrice) result = 'win';
        if (data.prediction === 'DOWN' && newPrice < lastPrice) result = 'win';

        // Send result clearly back to frontend
        socket.emit('prediction-result', {
          result,
          previousPrice: lastPrice,
          newPrice
        });

        lastPrice = newPrice; // Update clearly for next prediction
      } catch (err) {
        console.error('Error processing prediction:', err.message);
      }
    }, 5000); // clearly 5-second delay
  });

  socket.on('disconnect', () => console.log('Player disconnected:', socket.id));
});

server.listen(process.env.PORT || 5000, () => {
  console.log('Server running');
});
