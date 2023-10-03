//@ts-nocheck
const mongoose = require('mongoose');


const TicTacToe = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    gameState: {
        type:[String],
    },
    turn:{
        type: String,
    },
});

module.exports = mongoose.model('tictactoe',TicTacToe);