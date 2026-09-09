let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim().replace(/\/$/, ''))
    : [];

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    ...envOrigins
  ];

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, '');

        if (
          allowedOrigins.includes('*') ||
          allowedOrigins.includes(cleanOrigin) ||
          cleanOrigin.endsWith('.vercel.app') ||
          cleanOrigin.includes('localhost') ||
          cleanOrigin.includes('127.0.0.1') ||
          cleanOrigin.includes('192.168.') ||
          cleanOrigin.includes('10.0.')
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true
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
