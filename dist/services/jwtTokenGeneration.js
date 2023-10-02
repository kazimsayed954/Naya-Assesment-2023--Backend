"use strict";
//@ts-nocheck
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const jwt = require('jsonwebtoken');
function generateJWTToken(user, expiresIn = '30days') {
    return __awaiter(this, void 0, void 0, function* () {
        const secretKey = process.env.SECRET_KEY;
        const payload = {
            userId: user._id,
            email: user.email,
            name: user.name
        };
        const options = { expiresIn, };
        const token = jwt.sign(payload, secretKey, options);
        return token;
    });
}
module.exports = generateJWTToken;
