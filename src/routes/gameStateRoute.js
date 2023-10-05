const express = require('express');
const { 
    saveGameState,
    updateGameState,
    deleteGameState,
    getAllGameState,
    getSingleGameState
} = require('../controllers/gameStateController.js')

const router = express.Router();

router.get('/getall',getAllGameState);
router.get('/getbyid/:id',getSingleGameState);
router.put('/update/:id',updateGameState);
router.post('/save',saveGameState);
router.delete('/delete/:id',deleteGameState);

module.exports = router;