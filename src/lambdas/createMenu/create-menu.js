const db = require("../../../db");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const handler = async (event) => {
  const response = { statusCode: 200 };

  try {
    // const body = event.body; // in local development, parsing gives an error
    const body = JSON.parse(event.body);
    console.log({ body });
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: marshall(body || {}),
    };
    const createResult = await db.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully created post.",
      createResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create post.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const createMenu = middy(handler).use(cors());
module.exports = { createMenu };
