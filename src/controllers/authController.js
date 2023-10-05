
const bcrypt = require("bcrypt");
const userSchema = require("../models/User.js");
const sendMail = require("../services/verificationEmail.js");
const HTTP_STATUS_CODES = require("../constants/ServerCode.js");
const generateJWTToken = require("../services/jwtTokenGeneration.js");
const saltRound = process.env.SALT_ROUNDS;

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    let data = await userSchema.findOne({ email: email });
    if (data) {
      if (
        bcrypt.compareSync(password, data.password) &&
        data.isEmailVerfied === 1
      ) {
        const token = await generateJWTToken(data);
        return res
          .status(HTTP_STATUS_CODES.SUCCESS_OK)
          .json({ message: "Login Success", token, user:{name:data?.name,email:data?.email,userId:data?._id} });
      } else if (
        bcrypt.compareSync(password, data.password) &&
        data.isEmailVerfied === 0
      ) {
        return res
          .status(HTTP_STATUS_CODES.CLIENT_FORBIDDEN)
          .json({ message: "Please verify your email." });
      } else {
        return res
          .status(HTTP_STATUS_CODES.CLIENT_UNAUTHORIZED)
          .json({ message: "Invalid Credentials" });
      }
    } else {
      return res
        .status(HTTP_STATUS_CODES.CLIENT_UNAUTHORIZED)
        .json({ message: "Incorrect User or Password" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(HTTP_STATUS_CODES.CLIENT_BAD_REQUEST)
      .json({ message: "Something went wrong" });
  }
};

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userData = await userSchema.findOne({ email });
    if (!userData) {
      const hashedPassword = await bcrypt.hash(password, Number(saltRound));
      const user = new userSchema({ name, email, password: hashedPassword });
      let data = await user.save();
      sendMail(data, req);

      return res
        .status(HTTP_STATUS_CODES.SUCCESS_CREATED)
        .json({ message: "Activation Email Sended to your mail" });
    } else {
      return res.status(HTTP_STATUS_CODES.CONFLICT_DUPLICATE).json({ message: "User Already Exist" });
    }
  } catch (error) {
    console.log(error);
    return res.status(HTTP_STATUS_CODES.CLIENT_BAD_REQUEST).json({ message: "Something went wrong" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userSchema.findOne({ _id: id });
    if (user) {
        if( user.isEmailVerfied === 0){
            user.isEmailVerfied = 1;
            await user.save();
            return res.render('verifyEmail', { message: "Email has been verified",secondMessage:'Now you can proceed with signin' });
        }
        else{
            return res.render('verifyEmail', { message: "Already Email is verified",secondMessage:'Please do the sigin to access the Naya Game' });
        }
    } else {
        return res.render('verifyEmail', { message: "Unable to Process" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signIn,
  signUp,
  verifyEmail,
};
