"use strict";
//@ts-nocheck
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    isEmailVerfied: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true });
module.exports = mongoose.model("user", userSchema);
