const axios = require('axios');

const handler = async (event) => {
  const location = event.queryStringParameters.location;
  const API_KEY = "1a9bcc3b53b248b486d24649223006";
  const url = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`;

  try {
    const {data} = await axios.get(url);

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (error) {
    const {status, statusText, headers, data} = error.response
    return {
      statusCode: status, 
      body: JSON.stringify({status, statusText, headers, data})
    }
  }
}

module.exports = { handler }
