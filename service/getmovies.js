const { DynamoDB} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDB({region:'us-east-2'});
const dynamoDB = DynamoDBDocument.from(client);
const utils = require('../utils/utils');

const userTable = 'madiascout-user';

async function getUser (username) {
    const params = {
      TableName: userTable,
      Key: {
        username: username
      }
    };
    const res = await dynamoDB.get(params);
    console.log("hello", res.Item)
    
    return res.Item;
  
}

async function getMovies(getMovieBody){
    const username = getMovieBody.username;
    const token = getMovieBody.token;

    const verified = utils.verify(username,token);

    if(!verified){
        return utils.buildResponse(401,{
            message: "Please login"
        });
    }

    const dynamoUser = await getUser(username.toLowerCase().trim());

    if(!dynamoUser){
        return utils.buildResponse(404,{
            message: "Username does not exist"
        });
    }

    return utils.buildResponse(200,{
        movies: dynamoUser.movies,
        message: "success"
    });

}

module.exports.getMovies = getMovies;