const express = require('express');
const axios = require('axios');
const app = express();
require('dotenv').config();

app.set('trust proxy', true);

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Visitor';

  const clientIp = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  console.log('Client IP:', clientIp);

  const ipToUse = (clientIp === '::1' || clientIp === '127.0.0.1') ? '8.8.8.8' : clientIp;

  try {
    // Fetch location from ipapi
    const locationResponse = await axios.get(`https://ipapi.co/${ipToUse}/json/`);
    if (!locationResponse.data || locationResponse.data.error) {
      throw new Error('Failed to get location');
    }

    console.log(locationResponse);

    const city = locationResponse.data.city || 'Unknown';
    const country = locationResponse.data.country_name || 'Unknown';
    const location = `${city}, ${country}`;
    // Fetch weather from OpenWeatherMap
    const weatherApiKey = process.env.OPENWEATHERMAP_API_KEY; // Ensure your .env file contains OPENWEATHERMAP_API_KEY
    const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather`, {
      params: {
        q: location,
        appid: weatherApiKey,
        units: 'metric' // To get temperature in Celsius
      }
    });

    if (!weatherResponse.data || weatherResponse.data.cod !== 200) {
      throw new Error('Failed to get weather data');
    }

    const temperature = weatherResponse.data.main.temp;

    res.json({
      client_ip: clientIp,
      location: location, 
      // country: country,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to determine location or weather' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
