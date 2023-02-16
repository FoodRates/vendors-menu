const db = require("../../../db");
const { UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const updateItem = (item, subject) => {
  const itemNameAndValueUpdated = {
    [subject.targetField]: subject.value,
  };
  const result = { ...item, ...itemNameAndValueUpdated };

  return result;
};

const updateRequestBody = (body, subject) => {
  const selectedTargetInBody = body.menu[subject.section];
  const sectionWithUpdatedValues = selectedTargetInBody.map((item) =>
    item.id === subject.id ? updateItem(item, subject) : item
  );

  return sectionWithUpdatedValues;
};

const updateMenu = async (event) => {
  const response = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    // const body = event.body; // for local invovation
    const subject = event.target;
    const sectionToChange = subject.section;

    const updatedBody = await updateRequestBody(body, subject);
    body.menu[sectionToChange] = updatedBody;

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
