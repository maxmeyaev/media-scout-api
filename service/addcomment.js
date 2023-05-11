const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDB({region:'us-east-2'});
const dynamoDB = DynamoDBDocument.from(client);
const utils = require('../utils/utils');

const movieTable = 'movieComments';

async function getMovie (movieID) {
    const params = {
      TableName: movieTable,
      Key: {
        movieID: movieID
      }
    };
    const res = await dynamoDB.get(params);
    return res.Item;
}

async function add(addCommentBody){
    const username = addCommentBody.username;
    const comment = addCommentBody.comment;
    const movieID = addCommentBody.movieID;
    
    const post = {
        username : username,
        comment : comment
    }
    
    let dynamoMovie = await getMovie(movieID);
    
    if(!dynamoMovie){
        return utils.buildResponse(401,{
            message: "MovieID does not exist"
        })
    }
    
    const params = {
        TableName : movieTable,
        Key:{
            movieID : movieID
        },
        UpdateExpression: 'SET comments = list_append(comments, :vals)',
         ExpressionAttributeValues: {
            ":vals": [post]  
        }
    }
    
    const response = await dynamoDB.update(params);
    if(!response){
        return utils.buildResponse(503, {
         message: 'Server Error. Please try again later'
        });
    }
    return utils.buildResponse(200,{
        message: "Added post",
        post: post
        
    });
    
    
    
}

module.exports.add = add;