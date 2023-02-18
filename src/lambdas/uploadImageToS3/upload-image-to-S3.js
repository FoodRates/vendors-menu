const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const middy = require("middy");
const { cors } = require("middy/middlewares");

const BUCKET_NAME = process.env.FILE_UPLOAD_BUCKET_NAME;

const handler = async (event) => {
  const response = {
    isBase64Encoded: false,
    statusCode: 200,
    body: JSON.stringify({
      message: "Successfully updated the file on source. Policy changed.",
    }),
  };

  try {
    const parsedBody = JSON.parse(event.body);
    // const parsedBody = event.body; // local invocation
    const base64File = parsedBody.file;
    const decodedFile = Buffer.from(
      base64File.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const params = {
      Bucket: BUCKET_NAME,
      Key: `images/${new Date().toISOString()}.jpeg`,
      Body: decodedFile,
      ContentType: "image/jpeg",
      Event: event,
    };

    const uploadResult = await s3.upload(params).promise();

    response.body = JSON.stringify({
      message: "Successfully uploaded file to S3.",
      uploadResult,
      RequestBodyOfVendor: parsedBody,
    });
  } catch (e) {
    console.error(e);
    response.body = JSON.stringify({
      message: "File failed to upload.",
      errorMessage: e,
    });
    response.statusCode = 500;
  }

  return response;
};

const uploadImageToS3 = middy(handler).use(cors());
module.exports = { uploadImageToS3 };
