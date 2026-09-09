let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',').map(s => s.trim());

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join-field', (fieldId) => {
      socket.join(`field-${fieldId}`);
      console.log(`   Socket ${socket.id} joined field-${fieldId}`);
    });

    socket.on('join-admin', () => {
      socket.join('admin-room');
      console.log(`   Socket ${socket.id} joined admin-room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized');
  return io;
}

function getIO() {
  return io;
}

module.exports = { initSocket, getIO };
