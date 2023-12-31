
const MineSweeper = require("../models/Minesweeper.js");
const TicTacToe = require("../models/Tictactoe.js");
const saveGameState = async (req, res) => {
  try {
    const { userId } = req.user;
    const { gameType } = req.body;
    if (gameType === "minesweeper") {
      const { board, score, gameOver } = req.body;
      const game = new MineSweeper({ userId, board, score, gameOver });
      await game.save();
      return res.status(201).json({ message: "Game state saved successfully" });
    }
    if (gameType === "tictactoe") {
      const { board, playerTurn, winner } = req.body;
      const game = new TicTacToe({ userId, board, playerTurn, winner });
      await game.save();
      return res.status(201).json({ message: "Game state saved successfully" });
    } else {
      return res.status(400).json({ message: "Invalid game type" });
    }
  } catch (error) {
    console.log("er", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateGameState = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { gameType } = req.body;

    if (gameType === "minesweeper") {
      const { board, score, gameOver } = req.body;

      const existingGame = await MineSweeper.findOne({ _id: id, userId });
      if (!existingGame) {
        return res.status(404).json({ message: "Game state not found" });
      }

      // Update the game state properties
      existingGame.board = board;
      existingGame.score = score;
      existingGame.gameOver = gameOver;

      await existingGame.save();
      return res
        .status(200)
        .json({ message: "Game state updated successfully" });
    }
    if (gameType === "tictactoe") {
      const { board, playerTurn, winner } = req.body;

      const existingGame = await TicTacToe.findOne({ _id: id, userId });
      if (!existingGame) {
        return res.status(404).json({ message: "Game state not found" });
      }

      // Update the game state properties
      existingGame.board = board;
      existingGame.playerTurn = playerTurn;
      existingGame.winner = winner;

      await existingGame.save();
      return res
        .status(200)
        .json({ message: "Game state updated successfully" });
    } else {
      return res.status(400).json({ message: "Invalid game type" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteGameState = async (req, res) => {
  try {
    const { gametype } = req.query;
    const gameType = gametype;
    if (gameType === "minesweeper") {
      const { id } = req?.params;
      const { userId } = req.user;
      const deletedGame = await MineSweeper.findOneAndDelete({
        _id: id,
        userId,
      });
      if (!deletedGame) {
        return res.status(404).json({ message: "Game state not found" });
      }

      return res
        .status(200)
        .json({ message: "Game state deleted successfully" });
    } 

    if (gameType === "tictactoe") {
        const { id } = req?.params;
        const { userId } = req.user;
        const deletedGame = await TicTacToe.findOneAndDelete({
          _id: id,
          userId,
        });
        if (!deletedGame) {
          return res.status(404).json({ message: "Game state not found" });
        }
  
        return res
          .status(200)
          .json({ message: "Game state deleted successfully" });
      } 
    
    else {
      return res.status(400).json({ message: "Invalid game type" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllGameState = async (req, res) => {
  try {
    const { userId } = req.user;
    const { gametype } = req.query;
    const gameType = gametype;
    if (gameType === "minesweeper") {
      const gameStates = await MineSweeper.find({ userId })
        .sort({ updatedAt: -1 })
        ?.limit(5);
      return res.status(200).json(gameStates);
    }
    if (gameType === "tictactoe") {
        const gameStates = await TicTacToe.find({ userId })
        .sort({ updatedAt: -1 })
        ?.limit(5);
      return res.status(200).json(gameStates);
    } else {
      return res.status(400).json({ message: "Invalid game type" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSingleGameState = async (req, res) => {
  try {
    const { userId } = req.user;
    const { gametype } = req.query;
    const gameType = gametype;
    const { id } = req.params;
    if (gameType === "minesweeper") {
      const game = await MineSweeper.findOne({ _id: id, userId });
      if (!game) {
        return res.status(404).json({ message: "Game state not found" });
      }

      return res.status(200).json(game);
    }
    if (gameType === "tictactoe") {
        const game = await TicTacToe.findOne({ _id: id, userId });
        if (!game) {
          return res.status(404).json({ message: "Game state not found" });
        }
  
        return res.status(200).json(game);
      }
    else {
      return res.status(400).json({ message: "Invalid game type" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  saveGameState,
  updateGameState,
  deleteGameState,
  getAllGameState,
  getSingleGameState,
};
