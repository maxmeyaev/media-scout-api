const getCommentsService = require('./service/getcomments')
const addCommentService = require('./service/addcomment')
const util = require('./utils/utils')

const healthPath = '/health';
const getCommentsPath = '/getcomments';
const addCommentPath = '/addcomment';


exports.handler = async(event) => {
    console.log('Request Event: ', event);
    let response;
    switch(true){
        case event.httpMethod === 'GET' && event.path === healthPath:
          response = util.buildResponse(200);
          break;
        case event.httpMethod === 'GET' && event.path === getCommentsPath:
          const getCommentsBody = JSON.parse(event.body);
          response = await getCommentsService.get(getCommentsBody);
          break;
        case event.httpMethod === 'POST' && event.path === addCommentPath:
          const addCommentBody = JSON.parse(event.body);
          response = await addCommentService.add(addCommentBody);
          break;
        default:
          response = util.buildResponse(404, '303 Not Found');
      }
  return response;
}