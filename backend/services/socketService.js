import { Server } from 'socket.io';

let io;

/**
 * Initializes socket.io connection with the HTTP server
 * @param {Object} httpServer - HTTP server instance
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`New Socket Client Connected: ${socket.id}`);
    }

    // 1. Join personal user notifications channel room
    socket.on('join_user', (userId) => {
      socket.join(`user_${userId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket Client ${socket.id} joined personal room user_${userId}`);
      }
    });

    // 2. Join order live delivery tracking channel room (for customer and partner)
    socket.on('join_order_tracking', (orderId) => {
      socket.join(`order_${orderId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket Client ${socket.id} joined order tracking room order_${orderId}`);
      }
    });

    // 3. Receive and broadcast live partner coordinates
    socket.on('share_location', ({ orderId, longitude, latitude }) => {
      // Broadcast location coordinates to everyone in the order tracking room (primarily the customer)
      io.to(`order_${orderId}`).emit('location_update', {
        longitude,
        latitude,
        timestamp: new Date(),
      });
    });

    // 4. Handle client disconnect
    socket.on('disconnect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Socket Client Disconnected: ${socket.id}`);
      }
    });
  });

  return io;
};

/**
 * Sends a real-time event to a specific user
 * @param {string} userId - Recipient user database ID
 * @param {string} eventName - Socket event descriptor
 * @param {Object} data - Payload content
 */
export const emitToUser = (userId, eventName, data) => {
  if (io) {
    io.to(`user_${userId}`).emit(eventName, data);
  }
};

/**
 * Sends a real-time event to all clients tracking an order
 * @param {string} orderId - Order database ID
 * @param {string} eventName - Socket event descriptor
 * @param {Object} data - Payload content
 */
export const emitToOrder = (orderId, eventName, data) => {
  if (io) {
    io.to(`order_${orderId}`).emit(eventName, data);
  }
};
