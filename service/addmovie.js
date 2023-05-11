const { DynamoDB} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument} = require("@aws-sdk/lib-dynamodb");
const jwt = require('jsonwebtoken');
const utils = require('../utils/utils');

const client = new DynamoDB({region:'us-east-2'});
const dynamoDB = DynamoDBDocument.from(client);

const userTable = 'madiascout-user';


function verify(username, token){
    return jwt.verify(token, process.env.JWT_SECRET_KEY, (error, response)=>{
        if(error || response.username !== username){
            return false;
        }
        return true;
    })
}

async function addMovie(movieBody){
    const username = movieBody.username.toLowerCase().trim();
    const token = movieBody.token;
    const movieID = movieBody.movieID;

    const verified = verify(username,token);

    if(!verified){
        return utils.buildResponse(401,{
            message: "Please login"
        });
    }

    const updateMoviesResponse = await updateMovies(username, movieID);

    if(!updateMoviesResponse){
        return utils.buildResponse(503,{
            message: "Server Error. Please try again later."
        })
    }

    return utils.buildResponse(200, {message: updateMoviesResponse +" MovieID: " + movieID});
}

async function getUser (username) {
    const params = {
      TableName: userTable,
      Key: {
        username: username
      }
    };
    const res = await dynamoDB.get(params);
    return res.Item;
  
  }

async function updateMovies(username, movieID){
    let dynamoUser = await getUser(username);

    const index = dynamoUser.movies.indexOf(movieID);
    console.log("DynamoUser", dynamoUser);

    let res;
    let params;

    console.log(index);

    if(index === -1){
        params = {
            TableName: userTable,
            Key:{
                username:username
            },
            UpdateExpression: 'SET movies = list_append(movies, :vals)',
            ExpressionAttributeValues: {
                ":vals": [movieID]  
            }
    
        }
        res = "Added"

    }
    else{
        params = {
            TableName: userTable,
            Key:{
                username:username
            },

            UpdateExpression: `REMOVE movies[${index}]`,
            ConditionExpression: `movies[${index}] = :valueToRemove`,
            ExpressionAttributeValues: {
                ":valueToRemove": movieID
                // ":index": index
              }


        }
        res = 'Removed'
    }

    // console.log(params);

    const response = await dynamoDB.update(params);

    if (!response){
        res = "";
    }

    return res

}

module.exports.addMovie = addMovie;

