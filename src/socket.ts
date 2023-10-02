//@ts-nocheck
const { SocketControllers } = require('socket-controllers');
const { Server } = require("socket.io");

const socketServer =  (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // io.on("connection", (socket) => {

  // });

//   useSocketControllers(io, { controllers: [__dirname + "/socketGameControllers/TicTacToe/*.ts"] });
new SocketControllers({
  
    controllers: [__dirname + "/socketGameControllers/TicTacToe/*.ts"],
  });

  return io;
};

module.exports = socketServer;