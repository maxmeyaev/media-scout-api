const registerService = require('./service/register')
const loginService = require('./service/login')
const verifyService = require('./service/verify')
const addMovieService = require('./service/addmovie')
const util = require('./utils/utils')

const healthPath = '/health';
const registerPath = '/register';
const loginPath = '/login';
const verifyPath = '/verify';
const addMoviePath = '/useraddmovie';


exports.handler = async(event) => {
  console.log('Request Event: ', event);
  let response;
  switch(true){
    case event.httpMethod === 'GET' && event.path === healthPath:
      response = util.buildResponse(200);
      break;
    case event.httpMethod === 'POST' && event.path === registerPath:
      const registerBody = JSON.parse(event.body);
      response = await registerService.register(registerBody);
      break;
    case event.httpMethod === 'POST' && event.path === loginPath:
      const loginBody = JSON.parse(event.body);
      response = await loginService.login(loginBody);
      break;
    case event.httpMethod === 'POST' && event.path === verifyPath:
      const verifyBody = JSON.parse(event.body);
      response = verifyService.verify(verifyBody);
      break;
    case event.httpMethod === 'POST' && event.path === addMoviePath:
      const movieBody = JSON.parse(event.body);
      response = addMovieService.addMovie(movieBody);
      break;

    default:
      response = util.buildResponse(404, '303 Not Found');
  }
  return response;
};

function buildResponse(statusCode, body){
  return{
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type':'application/json'
    },
    body:JSON.stringify(body)
  }
}

