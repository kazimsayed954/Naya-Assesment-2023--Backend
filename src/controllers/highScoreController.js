const highScore = require("../models/HighScore.js");
const HTTP_STATUS_CODES = require("../constants/ServerCode.js");

const saveGameHighestScore = async (req, res) => {
  const { userId } = req.user;
  const { gameType } = req.body;
  try {
    if (gameType === "minesweeper") {
      const { score } = req.body;

      const oldHighScore = await highScore.findOne({ userId, gameType });
      if (oldHighScore) {
        if (Number(oldHighScore.score) < Number(score)) {
          // If the new score is higher, update the existing high score
          oldHighScore.score = score;
          await oldHighScore.save();
          return res
            .status(HTTP_STATUS_CODES.SUCCESS_OK)
            .json({ message: "New high score saved." });
        }
      } else {
        // If there's no existing high score, create a new record
        const newHighScore = new highScore({ userId, score, gameType });
        await newHighScore.save();
        return res
          .status(HTTP_STATUS_CODES.SUCCESS_OK)
          .json({ message: "High score saved." });
      }
    } else {
      return res.status(HTTP_STATUS_CODES.CLIENT_BAD_REQUEST).json({ message: "Invalid game type" });
    }
  } catch (error) {
    return res.status(HTTP_STATUS_CODES.SERVER_INTERNAL_ERROR).json({ message: "Internal server error" });
  }
};

const getUserHighScore = async (req, res) => {
    const { userId } = req.user;
  
    try {
      // Find the high score record for the specified user
      const userHighScore = await highScore.find({ userId });
  
      if (userHighScore) {
        return res.status(200).json({ highScore: userHighScore });
      } else {
        return res.status(404).json({ message: "High score not found for this user." });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

module.exports = {
  saveGameHighestScore,
  getUserHighScore
};
