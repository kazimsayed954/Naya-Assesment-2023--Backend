"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//@ts-nocheck
const bcrypt = require("bcrypt");
const userSchema = require("../models/User");
const sendMail = require("../services/verificationEmail");
const HTTP_STATUS_CODES = require("../constants/ServerCode");
const generateJWTToken = require("../services/jwtTokenGeneration");
const saltRound = process.env.SALT_ROUNDS;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        let data = yield userSchema.findOne({ email: email });
        if (data) {
            if (bcrypt.compareSync(password, data.password) &&
                data.isEmailVerfied === 1) {
                const token = yield generateJWTToken(data);
                return res
                    .status(HTTP_STATUS_CODES.SUCCESS_OK)
                    .json({ message: "Login Success", token, user: { name: data === null || data === void 0 ? void 0 : data.name, email: data === null || data === void 0 ? void 0 : data.email, userId: data === null || data === void 0 ? void 0 : data._id } });
            }
            else if (bcrypt.compareSync(password, data.password) &&
                data.isEmailVerfied === 0) {
                return res
                    .status(HTTP_STATUS_CODES.CLIENT_FORBIDDEN)
                    .json({ message: "Please verify your email." });
            }
            else {
                return res
                    .status(HTTP_STATUS_CODES.CLIENT_UNAUTHORIZED)
                    .json({ message: "Invalid Credentials" });
            }
        }
        else {
            return res
                .status(HTTP_STATUS_CODES.CLIENT_UNAUTHORIZED)
                .json({ message: "Incorrect User or Password" });
        }
    }
    catch (error) {
        console.log(error);
        return res
            .status(HTTP_STATUS_CODES.CLIENT_BAD_REQUEST)
            .json({ message: "Something went wrong" });
    }
});
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const userData = yield userSchema.findOne({ email });
        if (!userData) {
            const hashedPassword = yield bcrypt.hash(password, Number(saltRound));
            const user = new userSchema({ name, email, password: hashedPassword });
            let data = yield user.save();
            sendMail(data, req);
            return res
                .status(HTTP_STATUS_CODES.SUCCESS_CREATED)
                .json({ message: "Activation Email Sended to your mail" });
        }
        else {
            return res.status(HTTP_STATUS_CODES.CONFLICT_DUPLICATE).json({ message: "User Already Exist" });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(HTTP_STATUS_CODES.CLIENT_BAD_REQUEST).json({ message: "Something went wrong" });
    }
});
const verifyEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield userSchema.findOne({ _id: id });
        if (user) {
            if (user.isEmailVerfied === 0) {
                user.isEmailVerfied = 1;
                yield user.save();
                return res.render('verifyEmail', { message: "Email has been verified", secondMessage: 'Now you can proceed with signin' });
            }
            else {
                return res.render('verifyEmail', { message: "Already Email is verified", secondMessage: 'Please do the sigin to access the Naya Game' });
            }
        }
        else {
            return res.render('verifyEmail', { message: "Unable to Process" });
        }
    }
    catch (error) {
        console.log(error);
    }
});
module.exports = {
    signIn,
    signUp,
    verifyEmail,
};
