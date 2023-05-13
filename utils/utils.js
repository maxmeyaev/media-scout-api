const jwt = require('jsonwebtoken');

function buildResponse (statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  };
}

function verify(username, token){
  return jwt.verify(token, process.env.JWT_SECRET_KEY, (error, response)=>{
      if(error || response.username !== username){
          return false;
      }
      return true;
  })
}

  module.exports.buildResponse = buildResponse;
  module.exports.verify = verify;