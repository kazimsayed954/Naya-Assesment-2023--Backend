

const jwt = require('jsonwebtoken');

async function generateJWTToken(user, expiresIn = '30days'){
    const secretKey = process.env.SECRET_KEY;
    const payload = {
        userId:user._id,
        email:user.email,
        name:user.name
    }
    const options={expiresIn,}
    const token = jwt.sign(payload,secretKey,options)
    return token;
}

module.exports = generateJWTToken;