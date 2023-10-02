//@ts-nocheck
const {
    ConnectedSocket,
    MessageBody,
    OnMessage,
    SocketController,
    SocketIO,
  } = require('socket-controllers')
  const { Server, Socket }  = require("socket.io");
  
  @SocketController()
   class GameController {
    private getSocketGameRoom(socket: Socket): string {
      const socketRooms = Array.from(socket.rooms.values()).filter(
        (r) => r !== socket.id
      );
      const gameRoom = socketRooms && socketRooms[0];
  
      return gameRoom;
    }
  
    @OnMessage("update_game")
    public async updateGame(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() message: any
    ) {
      const gameRoom = this.getSocketGameRoom(socket);
      socket.to(gameRoom).emit("on_game_update", message);
    }
  
    @OnMessage("game_win")
    public async gameWin(
      @SocketIO() io: Server,
      @ConnectedSocket() socket: Socket,
      @MessageBody() message: any
    ) {
      const gameRoom = this.getSocketGameRoom(socket);
      socket.to(gameRoom).emit("on_game_win", message);
    }
  }

  module.exports = GameController;