require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIO = require('socket.io');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.io setup for real-time updates
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Online Polling & Survey API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      polls: '/api/polls',
      votes: '/api/votes',
      health: '/api/health'
    }
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);

  // Join a poll room
  socket.on('joinPoll', (pollId) => {
    socket.join(`poll_${pollId}`);
    console.log(`📊 Client ${socket.id} joined poll: ${pollId}`);
  });

  // Leave a poll room
  socket.on('leavePoll', (pollId) => {
    socket.leave(`poll_${pollId}`);
    console.log(`🚪 Client ${socket.id} left poll: ${pollId}`);
  });

  // Handle new vote
  socket.on('newVote', (data) => {
    console.log('📡 New vote received, broadcasting to poll:', data.pollId);
    io.to(`poll_${data.pollId}`).emit('voteUpdate', data);
  });

  // Disconnect
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`);
  });

  // Error handling
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
  });
});

// Broadcast vote updates helper
app.broadcastVote = (pollId, voteData) => {
  console.log('📡 Broadcasting vote update to poll:', pollId);
  io.to(`poll_${pollId}`).emit('voteUpdate', voteData);
};

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
      Server running in ${process.env.NODE_ENV || 'development'} mode  
      Port: ${PORT}                         
      Database: MongoDB                    
      WebSocket: Socket.io                 
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
