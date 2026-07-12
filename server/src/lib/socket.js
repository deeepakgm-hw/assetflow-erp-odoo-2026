const { Server } = require("socket.io");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join room dedicated to a specific user (support teammate's event)
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        console.log(`👤 Socket ${socket.id} joined room user-${userId}`);
      }
    });

    // Support our event
    socket.on("join-user", (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        console.log(`👤 Socket ${socket.id} joined room user-${userId}`);
      }
    });

    // Join department room for department-specific events
    socket.on("join-department", (deptId) => {
      if (deptId) {
        socket.join(`dept-${deptId}`);
        console.log(`🏢 Socket ${socket.id} joined room dept-${deptId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user-${userId}`).emit(event, data);
  }
};

const emitToDepartment = (deptId, event, data) => {
  if (io) {
    io.to(`dept-${deptId}`).emit(event, data);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToDepartment,
  broadcast
};
