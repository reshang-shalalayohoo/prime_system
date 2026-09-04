let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
