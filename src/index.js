const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { userId, highScore, numOfChars } = body;

  if (!userId || highScore === undefined || numOfChars === undefined) {
    return {
      statusCode: 400,
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
    let newNumOfChars = numOfChars;

    if (userRecord.Item) {
      const existingHighScore = userRecord.Item.HighScore;
      const existingNumOfChars = userRecord.Item.NumOfChars;

      if (highScore <= existingHighScore) {
        newHighScore = existingHighScore;
      }
      newNumOfChars += existingNumOfChars;
    }

    await dynamodb
      .put({
        TableName: TABLE_NAME,
        Item: {
          UserID: userId,
          HighScore: newHighScore,
          NumOfChars: newNumOfChars,
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        UserID: userId,
        HighScore: newHighScore,
        NumOfChars: newNumOfChars,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
