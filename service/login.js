const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDB({region:'us-east-2'});
const dynamoDB = DynamoDBDocument.from(client);
const utils = require('../utils/utils');
const bcrypt = require('bcryptjs');
const auth = require('../utils/auth');

// const dynamoDB = new AWS.dynamoDB.DocumentClient();
const userTable = 'madiascout-user';
// let dynamoUser = "";

async function login(user){
    
    // const items = dynamoDB.scan({TableName: userTable}, function(err, data) {
    //   if (err) console.log(err);
    //   else console.log(data);
    // })
    
    // console.log(items)
    
    const username = user.username.toLowerCase().trim();
    const password = user.password;
    if(!user || !username|| !password){
        return utils.buildResponse(401, {
            message: 'Username and password required'
        })
    }

    const dynamoUser = await getUser(username);
    
    console.log(dynamoUser);
  
    
    if(!dynamoUser || !dynamoUser.username){
        return utils.buildResponse(403,{
            message : "User does not exist"
        })
    }

    if(!bcrypt.compareSync(password, dynamoUser.password)){
        return utils.buildResponse(403, {
            message: 'Password is incorrect'
        })
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }

    const token = auth.generateToken(userInfo);
    const response = {
        user: userInfo,
        token: token
    }
    return utils.buildResponse(200, response);
}

// async function getUser (username) {
//     const params = {
//       TableName: userTable,
//       Key: {
//         username: username
//       }
//     };
//     return await dynamoDB.get(params).promise().then(response => {
//     return response.Item;
//   }, error => {
//     console.error('There is an error getting user: ', error);
//   })
  
// }

// async function getUser (username) {
//   const params = {
//     TableName: userTable,
//     Key: {
//       username: username
//     }
//   };
//   return await dynamoDB.get(params, function(err, data) {
//   if (err) console.log(err);
//   else {
//     console.log(data)
//     dynamoUser = data.Item;
//   }
// });
// }

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
//   return await dynamoDB.get(params, function(err, data) {
//       if (err)return(err);
//       console.log(data.Item);
//       return data.Item;
      
// });
}

module.exports.login = login;