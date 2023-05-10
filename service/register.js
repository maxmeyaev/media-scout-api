const { DynamoDB} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDB({region:'us-east-2'});
const dynamoDB = DynamoDBDocument.from(client);
const utils = require('../utils/utils');
const bcrypt = require('bcryptjs');
const userTable = 'madiascout-user';

async function register (userInfo) {
  const name = userInfo.name;
  const email = userInfo.email;
  const username = userInfo.username;
  const password = userInfo.password;
  if (!username || !email || !password || !name) {
    return utils.buildResponse(401, {
      message: 'All fields are required'
    });
  }

  const dynamoUser = await getUser(username.toLowerCase().trim());
  
  // console.log(dynamoUser.username)
  if (dynamoUser && dynamoUser.username) {
    return utils.buildResponse(401, {
      message: 'username already  exsists in our database. Please choose a different username'
    });
  }
  const encryptedPW = bcrypt.hashSync(password.trim(), 10);
  const user = {
    name: name,
    email: email,
    username: username.toLowerCase().trim(),
    password: encryptedPW,
    movies: []
  };

  const saveUserResponse = await saveUser(user);
  if (!saveUserResponse) {
    return utils.buildResponse(503, {
      message: 'Server Error. Please try again later'
    });
  }

  return utils.buildResponse(200, { username: username });
}

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





async function saveUser (user) {
  const params = {
    TableName: userTable,
    Item: user
  };
  return await dynamoDB.put(params);
}

module.exports.register = register;