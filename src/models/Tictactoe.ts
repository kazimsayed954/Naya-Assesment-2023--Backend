//@ts-nocheck
const mongoose = require('mongoose');


const TicTacToe = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    board: [String],
    playerTurn: Boolean,
    winner: String,
},{timestamps:true});

module.exports = mongoose.model('tictactoe',TicTacToe);