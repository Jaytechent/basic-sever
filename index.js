const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Visitor';
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  console.log('Client IP:', clientIp);

  try {
    // Get the location based on the client's IP address
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    console.log('Location response:', locationResponse.data);

    if (!locationResponse.data || locationResponse.data.status !== 'success') {
      throw new Error('Failed to get location');
    }

    const location = locationResponse.data.city || 'Unknown';
    const lat = locationResponse.data.lat;
    const lon = locationResponse.data.lon;

    if (!lat || !lon) {
      throw new Error('Unable to determine location coordinates');
    }

    // Get the current temperature from OpenWeatherMap
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
    console.log('Weather response:', weatherResponse.data);

    if (!weatherResponse.data || !weatherResponse.data.main) {
      throw new Error('Failed to get weather data');
    }

    const temperature = weatherResponse.data.main.temp;

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
