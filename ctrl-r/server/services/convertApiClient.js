// server/services/convertApiClient.js
const convertapiFactory = require("convertapi");

const secret = process.env.CONVERTAPI_SECRET;
if (!secret) {
  throw new Error("Missing CONVERTAPI_SECRET in server/.env");
}

// Official usage: require("convertapi")("api_token")
module.exports = convertapiFactory(secret);
