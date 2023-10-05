const express = require('express');
const { 
  getUserHighScore,
  saveGameHighestScore
} = require('../controllers/highScoreController.js')

const router = express.Router();

router.get('/getuserhighscore',getUserHighScore);
router.post('/savehighscore',saveGameHighestScore);

module.exports = router;