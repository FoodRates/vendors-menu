const db = require("../../../db");
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const getMenu = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ vendorId: event.pathParameters.vendorId }),
    };
    const { Item } = await db.send(new GetItemCommand(params));

    console.log({ Item });
    response.body = JSON.stringify({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      message: "Successfully retrieved menu.",
      data: Item ? unmarshall(Item) : {},
      rawData: Item,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to get menu.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  getMenu,
};
