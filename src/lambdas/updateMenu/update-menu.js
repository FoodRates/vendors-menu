const { DynamoDB } = require("aws-sdk");
const { cors } = require("middy/middlewares");
const middy = require("middy");
const due = require("../../utils/updateExpressionBuilder");

const formUpdateExpression = (original, modified) => {
  const updateExpression = due.getUpdateExpression({ original, modified });
  const {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  } = updateExpression;

  return {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  };
};

const processPutItemRequest = (params) => {
  console.log("params:::: ", params);
  const dynamoDB = new DynamoDB.DocumentClient({
    region: "us-west-1",
    profile: "default",
  });

  const { value } = params;
  const { original, modified } = value;

  const updatedExpressionParams = formUpdateExpression(original, modified);
  const {
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
  } = updatedExpressionParams;

  dynamoDB
    .update({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        vendorId: params.vendorId,
      },
      UpdateExpression: UpdateExpression,
      ExpressionAttributeNames: ExpressionAttributeNames,
      ExpressionAttributeValues: ExpressionAttributeValues,
      ReturnConsumedCapacity: "NONE",
      ReturnValues: "ALL_NEW",
    })
    .promise()
    .then((data) => {
      console.log("Output: ", JSON.stringify(data.Attributes));
    })
    .catch((error) => {
      console.error(error);
    });
};

const handler = async (event) => {
  const response = { statusCode: 200 };
  try {
    // const eventObject = JSON.parse(event);
    // const body = JSON.parse(event.body);
    // const eventObject = event; // for local invovation
    // const body = event.body; // for local invovation

    const params = {
      vendorId: event.pathParameters.vendorId,
      value: event.body,
    };

    console.log("what is it? ", typeof params, params);

    const updateResult = processPutItemRequest(params);

    response.body = JSON.stringify({
      message: "Successfully updated post.",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
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

const updateMenu = middy(handler).use(cors());
module.exports = { updateMenu };
