//@ts-nocheck
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet= require('helmet');
const authenticateJWT = require("./middlewares/authenticateJWT");
const generateJWTToken = require("./services/jwtTokenGeneration");
const authRoute = require("./routes/authRoute");
const gameStateRoute = require("./routes/gameStateRoute");
const { verifyEmail } = require("./controllers/authController");
const { randPiece,randRoom } = require("./utilities/TicTacToe/utils");
const Player = require("./utilities/TicTacToe/player");
const Board = require("./utilities/TicTacToe/board");

const PORT = process.env.PORT;

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views");
// middleware-setup
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const ioCorsOptions = {
  cors: {
    origin: "*",
  },
};
const server = http.createServer(app);
const io = socketio(server, ioCorsOptions);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/v1/", authRoute);
app.use("/api/v1/game",authenticateJWT, gameStateRoute);

app.get("/verify/:id", verifyEmail);

// Store the room ids mapping to the room property object
// The room property object looks like this {roomid:str, players:Array(2)}
const rooms = new Map();

//Promise function to make sure room id is unique
const makeRoom = (resolve) => {
  let newRoom = randRoom();
  while (rooms?.has(newRoom)) {
    newRoom = randRoom();
  }
    rooms.set(newRoom, { roomId: newRoom, players: [], board: new Board() });
  resolve(newRoom);
};

//Put the newly joined player into a room's player list
const joinRoom = (player, room) => {
  const currentRoom = rooms?.get(room);
  currentRoom?.players?.push(player);
};

//Remove the latest player joined from a room's player list
function kick(room) {
  let currentRoom = rooms.get(room);
  currentRoom?.players?.pop();
}

//Check how many player is currently in the room
function getRoomPlayersNum(room) {
  return rooms?.get(room).players.length;
}

//Assign x o values to each of the player class
function pieceAssignment(room) {
  const firstPiece = randPiece();
  const lastPiece = firstPiece === 'X' ? 'O' : 'X';

  const currentRoom = rooms.get(room);
  currentRoom.players[0]?.piece = firstPiece;
  currentRoom.players[1]?.piece = lastPiece;
}

//Initialize a new board to a room
function newGame(room) {
  const currentRoom = rooms.get(room);
  const board = new Board();
  currentRoom.board = board;
}

// Socket.io handling
io.on("connection", (socket) => {
  //On the client submit event (on start page) to create a new room
  socket.on("newGame", () => {
    try {
      new Promise(makeRoom).then((room) => {
        socket.emit("newGameCreated", room);
      });
      
    } catch (error) {
      
    }
  });

  //On the client submit event (on start page) to join a room
  socket.on("joining", ({ room }) => {
    try {
      if (rooms.has(room)) {
        socket.emit("joinConfirmed");
      } else {
        socket.emit("errorMessage", "No room with that id found");
      }
    } catch (error) {
      
    }
  });

  socket.on("newRoomJoin", ({ room, name }) => {
    try {
      
      let currentPlayers;
      //If someone tries to go to the game page without a room or name then
      //redirect them back to the start page
      if (room === "" || name === "") {
        io.to(socket.id).emit("joinError");
      }
  
      //Put the new player into the room
      socket.join(room);
      const id = socket.id;
      const newPlayer = new Player(name, room, id);
      joinRoom(newPlayer, room);
  
      //Get the number of player in the room
      const peopleInRoom = getRoomPlayersNum(room);
  
      //Need another player so emit the waiting event
      //to display the wait screen on the front end
      if (peopleInRoom === 1) {
        io.to(room).emit("waiting");
      }
  
      //The right amount of people so we start the game
      if (peopleInRoom === 2) {
        //Assign the piece to each player in the backend data structure and then
        //emit it to each of the player so they can store it in their state
        pieceAssignment(room);
        currentPlayers = rooms.get(room).players;
        for (const player of currentPlayers) {
          io.to(player.id).emit("pieceAssignment", {
            piece: player.piece,
            id: player.id,
          });
        }
        newGame(room);
  
        //When starting, the game state, turn and the list of both players in
        //the room are required in the front end to render the correct information
        const currentRoom = rooms.get(room);
        const gameState = currentRoom.board.game;
        const turn = currentRoom.board.turn;
        const players = currentRoom.players.map((player) => [
          player.id,
          player.name,
        ]);
        io.to(room).emit("starting", { gameState, players, turn });
      }
  
      //Too many people so we kick them out of the room and redirect
      //them to the main starting page
      if (peopleInRoom === 3) {
        socket.leave(room);
        kick(room);
        io.to(socket.id).emit("joinError");
      }
    } catch (error) {
      
    }
  });

  //Listener event for each move and emit different events depending on the state of the game
  socket.on("move", ({ room, piece, index }) => {
    try {
      const currentRoom = rooms.get(room);
      const currentBoard = currentRoom?.board;
    
      const currentPlayer = currentRoom.players.find((player) => player.id === socket.id);
      console.log("Current Player:", currentPlayer);
      console.log("Current Turn:", currentBoard?.getCurrentPlayer());
  
      if (currentPlayer && currentPlayer?.piece === currentBoard?.getCurrentPlayer()) {
        const validMove = currentBoard?.move(index, piece);
    
        if (validMove) {
          if (currentBoard?.checkWinner(piece)) {
            io.to(room).emit("winner", {
              gameState: currentBoard?.game,
              id: socket.id,
            });
          } else if (currentBoard?.checkDraw()) {
            io.to(room).emit("draw", { gameState: currentBoard?.game });
          } else {
            io.to(room).emit("update", {
              gameState: currentBoard?.game,
              turn: currentBoard?.getCurrentPlayer(),
            });
          }
        } else {
          
          io.to(socket.id).emit("errorMessage", "Invalid move.");
        }
      } else {
        
        io.to(socket.id).emit("errorMessage", "It's not your turn to make a move.");
      }
      
    } catch (error) {
      
    }
  });

  //Listener event for a new game
  socket.on("playAgainRequest", (room) => {
    try {
      const currentRoom = rooms.get(room);
      currentRoom.board.reset();
      //Reassign new piece so a player can't always go first
      pieceAssignment(room);
      const currentPlayers = currentRoom.players;
      for (const player of currentPlayers) {
        io.to(player.id).emit("pieceAssignment", {
          piece: player.piece,
          id: player.id,
        });
      }
  
      io.to(room).emit("restart", {
        gameState: currentRoom.board.game,
        turn: currentRoom.board.turn,
      });
      
    } catch (error) {
      
    }
  });

  //On disconnect event
  socket.on("disconnecting", () => {
    try {
      //Get all the rooms that the socket is currently subscribed to
      const currentRooms = Object.keys(socket.rooms);
      //In this game an object can only have 2 rooms max so we check for that
      if (currentRooms.length === 2) {
        //The game room is always the second element of the list
        const room = currentRooms[1];
        const num = getRoomPlayersNum(room);
        //If one then no one is left so we remove the room from the mapping
        if (num === 1) {
          rooms.delete(room);
        }
        //If 2 then there is one person left so we remove the socket leaving from the player list and
        //emit a waiting event to the other person
        if (num === 2) {
          currentRoom = rooms.get(room);
          currentRoom.players = currentRoom.players.filter(
            (player) => player.id !== socket.id
          );
          io.to(room).emit("waiting");
        }
      }
      
    } catch (error) {
      
    }
  });
});



server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
