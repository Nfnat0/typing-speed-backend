const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "https://d1vklekig7eztq.cloudfront.net",
    "Access-Control-Allow-Headers": "Content-Type,X-CSRF-TOKEN",
    "Access-Control-Allow-Methods": "PUT, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({}),
    };
  }
  const body = JSON.parse(event.body);
  const { userId, highScore, totalCharacters } = body;

  if (!userId || highScore === undefined) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Missing parameters" }),
    };
  }

  try {
    const userRecord = await dynamodb
      .get({
        TableName: TABLE_NAME,
        Key: { UserID: userId },
      })
      .promise();

    let newHighScore = highScore;

    if (userRecord.Item) {
      const existingHighScore = userRecord.Item.HighScore;

      if (highScore <= existingHighScore) {
        newHighScore = existingHighScore;
      }
    }

    await dynamodb
      .put({
        TableName: TABLE_NAME,
        Item: {
          UserID: userId,
          HighScore: newHighScore,
        },
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        UserID: userId,
        HighScore: newHighScore,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
