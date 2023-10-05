
const mongoose = require('mongoose');
const highscoreSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    highScore:{
        type:Number,
        default:0,
    },
    gameType:{
        type:String,
        default:null,
    }

},{timestamps:true})

module.exports = mongoose.model("highscore",highscoreSchema);