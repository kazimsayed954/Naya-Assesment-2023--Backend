  //@ts-nocheck
  const {
    ConnectedSocket,
    OnConnect,
    SocketController,
    SocketIO,
  } = require('socket-controllers');
  const { Socket, Server } = require("socket.io");
  
  @SocketController()
   class MainController {
    @OnConnect()
    public onConnection(
      @ConnectedSocket() socket: Socket,
      @SocketIO() io: Server
    ) {
      console.log("New Socket connected: ", socket.id);
  
      socket.on("custom_event", (data: any) => {
        console.log("Data: ", data);
      });
    }
  }

  module.exports = MainController;