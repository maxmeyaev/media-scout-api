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

async function get(getCommentsBody){
    const movieID = getCommentsBody.movieID;
    
    const dynamoMovie = await getMovie(movieID);
    
    
    
    if(!dynamoMovie){
        console.log("Movie was created since it did not exist");
        createMovie(movieID);
        return utils.buildResponse(200,{
            comments: []
        })
    }
    else{
        console.log("Movie exists",dynamoMovie.comments)
        return utils.buildResponse(200,{
            comments: dynamoMovie.comments
        })
    }
}

async function createMovie(movieID){
    const params = {
        TableName : movieTable,
        Item:{
            movieID : movieID,
            comments : []
        }
    }
    
    return await dynamoDB.put(params);
}

module.exports.get = get;