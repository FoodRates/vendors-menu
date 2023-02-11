const db = require("../../../db");
const { UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const updateMenu = async (event) => {
  const response = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);

    const keys = objKeys
      .map((_, index) => `#key${index} = :value${index}`)
      .join(", ");

    const names = objKeys.reduce(
      (acc, key, index) => ({
        ...acc,
        [`#key${index}`]: key,
      }),
      {}
    );

    const values = objKeys.reduce(
      (acc, key, index) => ({
        ...acc,
        [`:value${index}`]: body[key],
      }),
      {}
    );
    // console.log("key: ", keys, "\nnames: ", names, "\nvalues:", values);

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ vendorId: event.pathParameters.vendorId }),
      UpdateExpression: `SET ${keys}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: marshall(values),
    };
    const updateResult = await db.send(new UpdateItemCommand(params));

    response.body = JSON.stringify({
      message: "Successfully updated post.",
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to update post.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  updateMenu,
};
