const { DynamoDB } = require("aws-sdk");
const { cors } = require("middy/middlewares");
const middy = require("middy");

const processPutItemRequest = (params) => {
  const dynamoDB = new DynamoDB.DocumentClient({
    region: "us-west-1",
    profile: "default",
  });
  const { value } = params.value;

  dynamoDB
    .update({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        vendorId: params.vendorId,
      },
      // build the path below as such and construct "ExpressionAttributeNames" as shown:
      // it is crucial to put # in front of object key names because they could be reserved words.
      UpdateExpression: "SET #menu[0].#items[1].#price = :value",
      // For consistency, always use ExpressionAttributeNames for all attributes
      ExpressionAttributeNames: {
        "#menu": "menu",
        "#items": "items",
        "#price": "price",
      },
      ExpressionAttributeValues: {
        ":value": value,
      },
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
    const eventObject = JSON.parse(event);
    const body = JSON.parse(event.body);
    // const eventObject = event;
    // const body = event.body; // for local invovation

    const params = {
      vendorId: eventObject.pathParameters.vendorId,
      value: body,
    };

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
