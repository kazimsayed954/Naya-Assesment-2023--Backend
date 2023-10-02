//@ts-nocheck
require("dotenv").config();
require('reflect-metadata');
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const authenticateJWT = require("./middlewares/authenticateJWT");
const generateJWTToken = require("./services/jwtTokenGeneration");
const authRoute = require("./routes/authRoute");
const { verifyEmail } = require("./controllers/authController");
const { randPiece,randRoom } = require("./utilities/TicTacToe/utils");
const Player = require("./utilities/TicTacToe/player");
const Board = require("./utilities/TicTacToe/board");
// const socketServer = require('../src/socket');



const PORT = process.env.PORT;

const app = express();
app.set("view engine", "ejs");
app.set("views", __dirname + "/src/views");
// middleware-setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const ioCorsOptions = {
  cors: {
    origin: "*",
  },
};
const server = http.createServer(app);
const io = socketio(server, ioCorsOptions);
// const io = socketServer(server);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/api/v1/", authRoute);
app.get("/verify/:id", verifyEmail);

// Store the room ids mapping to the room property object
// The room property object looks like this {roomid:str, players:Array(2)}
const rooms = new Map();

//Promise function to make sure room id is unique
const makeRoom = (resolve) => {
  let newRoom = randRoom();
  while (rooms.has(newRoom)) {
    newRoom = randRoom();
  }
//   rooms.set(newRoom, { roomId: newRoom, players: [], board: null });
    rooms.set(newRoom, { roomId: newRoom, players: [], board: new Board() });
  resolve(newRoom);
};

//Put the newly joined player into a room's player list
const joinRoom = (player, room) => {
  // currentRoom = rooms.get(room);
  // updatedPlayerList = currentRoom.players.push(player);
  // updatedRoom = { ...currentRoom, players: updatedPlayerList };
  const currentRoom = rooms.get(room);
  currentRoom.players.push(player);
};

//Remove the latest player joined from a room's player list
function kick(room) {
  let currentRoom = rooms.get(room);
  currentRoom?.players?.pop();
}

//Check how many player is currently in the room
function getRoomPlayersNum(room) {
  return rooms.get(room).players.length;
}

//Assign x o values to each of the player class
function pieceAssignment(room) {
  const firstPiece = randPiece();
  const lastPiece = firstPiece === 'X' ? 'O' : 'X';

  const currentRoom = rooms.get(room);
  currentRoom.players[0].piece = firstPiece;
  currentRoom.players[1].piece = lastPiece;
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
    new Promise(makeRoom).then((room) => {
      socket.emit("newGameCreated", room);
    });
  });

  //On the client submit event (on start page) to join a room
  socket.on("joining", ({ room }) => {
    if (rooms.has(room)) {
      socket.emit("joinConfirmed");
    } else {
      socket.emit("errorMessage", "No room with that id found");
    }
  });

  socket.on("newRoomJoin", ({ room, name }) => {
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
  });

  //Listener event for each move and emit different events depending on the state of the game
  socket.on("move", ({ room, piece, index }) => {
        console.log(room,piece.index);
        const currentBoard = rooms.get(room).board;
        currentBoard.move(index, piece);
    // Ensure currentBoard is initialized with a new Board instance
  // if (!rooms.has(room) || !rooms.get(room).board) {
  //   // Initialize a new Board instance if it doesn't exist
  //   rooms.get(room).board = new Board();
  // }
  //   currentBoard = rooms.get(room).board;
  //   currentBoard.move(index, piece);

    // if (currentBoard.checkWinner(piece)) {
    //   io.to(room).emit("winner", {
    //     gameState: currentBoard.game,
    //     id: socket.id,
    //   });
    // } else if (currentBoard.checkDraw()) {
    //   io.to(room).emit("draw", { gameState: currentBoard.game });
    // } else {
    //   currentBoard.switchTurn();
    //   io.to(room).emit("update", {
    //     gameState: currentBoard.game,
    //     turn: currentBoard.turn,
    //   });
    if (currentBoard.checkWinner(piece)) {
      io.to(room).emit('winner', { gameState: currentBoard.game, id: socket.id });
    } else if (currentBoard.checkDraw()) {
      io.to(room).emit('draw', { gameState: currentBoard.game });
    } else {
      currentBoard.switchTurn();
      io.to(room).emit('update', { gameState: currentBoard.game, turn: currentBoard.turn });
    
    }
  });

  //Listener event for a new game
  socket.on("playAgainRequest", (room) => {
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
  });

  //On disconnect event
  socket.on("disconnecting", () => {
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
  });
});

// Define a Tic Tac Toe game state (you can use a more advanced data structure)
// const gameStates = new Map(); // Use a Map to store game states by room ID

// // Listen for incoming socket connections
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Join a room or create a new one
//   socket.on('joinRoom', (roomName) => {
//     socket.join(roomName);
    
//     if (!gameStates.has(roomName)) {
//       // If the room doesn't exist, create a new game state
//       gameStates.set(roomName, {
//         gameState: ['', '', '', '', '', '', '', '', ''],
//         currentPlayer: 'X',
//       });
//     }
//     const gameState = gameStates.get(roomName);
//     console.log('game',gameState);
//     // Send the current game state to the connected client
//     socket.emit('gameState', gameState);
//   });

//   // Handle a player's move
//   socket.on('move', (index, roomName) => {
//     console.log("in",index)
//     const gameState = gameStates.get(roomName);
//     console.log("gameState-m", gameState);
//     if (!gameState) {
//       // Room doesn't exist
//       return;
//     }
//     if (gameState.gameState[index] === '' && gameState.currentPlayer === 'X') {
//       gameState.gameState[index] = 'X';
//       gameState.currentPlayer = 'O';
//       io.to(roomName).emit('gameState', gameState);
//     } else if (
//       gameState.gameState[index] === '' &&
//       gameState.currentPlayer === 'O'
//     ) {
//       gameState.gameState[index] = 'O';
//       gameState.currentPlayer = 'X';
//       io.to(roomName).emit('gameState', gameState);
//     }
//   });

//   // Handle game restart
//   socket.on('restart', (roomName) => {
//     console.log('r',roomName)
//     const gameState = gameStates.get(roomName);
//     if (gameState) {
//       gameState.gameState = ['', '', '', '', '', '', '', '', ''];
//       gameState.currentPlayer = 'X';
//       io.to(roomName).emit('gameState', gameState);
//     }
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log('A user disconnected');
//   });
// });


server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
