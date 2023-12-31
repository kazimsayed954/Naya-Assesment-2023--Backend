
const HTTP_STATUS_CODES = {
    SUCCESS_OK: 200,
    SUCCESS_CREATED: 201,
    SUCCESS_ACCEPTED: 202,
    CLIENT_BAD_REQUEST: 400,
    CLIENT_UNAUTHORIZED: 401,
    CLIENT_FORBIDDEN: 403,
    CLIENT_NOT_FOUND: 404,
    CONFLICT_DUPLICATE: 409, 
    SERVER_INTERNAL_ERROR: 500,
  };
  
  module.exports = HTTP_STATUS_CODES;