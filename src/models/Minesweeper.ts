//@ts-nocheck

const mongoose = require('mongoose');

const cellSchema = new mongoose.Schema({
    isOpen: Boolean,
    isMine: Boolean,
});

const MineSweeper = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    board: [[cellSchema]],
    score: Number,
    gameOver: Boolean,
},{timestamps:true});

module.exports = mongoose.model('minesweeper',MineSweeper);