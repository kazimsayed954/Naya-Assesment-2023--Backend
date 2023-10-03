//@ts-nocheck
const jwt = require('jsonwebtoken');
const HTTP_STATUS_CODES = require('../constants/ServerCode');

function authenticateJWT(req,res,next){
    const secretKey = process.env.SECRET_KEY;
    const { CLIENT_UNAUTHORIZED } = HTTP_STATUS_CODES;
    const token = req.header('Authorization');
    if (!token) {
        return res.status(CLIENT_UNAUTHORIZED).json({ message: 'Authentication failed: No token provided' });
      }

      jwt.verify(JSON.parse(token), secretKey, (err, decoded) => {
        if (err) {
          return res.status(CLIENT_UNAUTHORIZED).json({ message: 'Authentication failed: Invalid token' });
        }
    
        // If token is valid, store the decoded user data in the request object
        req.user = decoded;
    
        // Continue to the next middleware or route
        next();
      });
    
}


module.exports = authenticateJWT;
