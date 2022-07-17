const axios = require('axios');

const handler = async (event) => {
  const lat = event.queryStringParameters.lat;
  const lon = event.queryStringParameters.lon;
  const API_KEY = "1fe4d6fcffb273c22daff0999d14ce8a";
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

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
