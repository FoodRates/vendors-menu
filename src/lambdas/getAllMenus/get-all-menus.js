const db = require("../../../db");
const middy = require("middy");
const { cors } = require("middy/middlewares");
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const handler = async () => {
  const response = { statusCode: 200 };

  try {
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );

    response.body = JSON.stringify({
      message: "Successfully retrieved all menus.",
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve menus.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const getAllMenus = middy(handler).use(cors());
module.exports = { getAllMenus };
