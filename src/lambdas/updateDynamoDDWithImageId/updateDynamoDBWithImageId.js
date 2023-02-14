const updateDBWithNewImageId = async (event) => {
  const response = { statusCode: 200 };
  try {
    response.body = JSON.stringify({
      message: "update DB with image url.",
      event: event,
    });
  } catch (error) {
    console.log("error occured while updating DB.");
    throw error;
  }

  return response;
};

module.exports = { updateDBWithNewImageId };
