exports.handler = async (event, context) => {
  if (event.httpMethod === "GET") {
    const verificationCode = event.queryStringParameters.verificationCode;
    return {
      statusCode: 200,
      body: verificationCode,
    };
  }

  if (event.httpMethod === "POST") {
    const eventData = JSON.parse(event.body);
    console.log("Received Clover webhook:", eventData);
    return {
      statusCode: 200,
      body: "Webhook received",
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
