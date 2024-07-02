const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Visitor';
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Use a default IP for testing in case clientIp is '::1' (localhost)
  const ipToUse = clientIp === '::1' ? '8.8.8.8' : clientIp;

  try {
    // Fetch location from ipapi
    const locationResponse = await axios.get(`https://ipapi.co/${ipToUse}/json/`);
    if (!locationResponse.data || locationResponse.data.error) {
      throw new Error('Failed to get location');
    }

    const location = locationResponse.data.city || 'Unknown';
    const lat = locationResponse.data.latitude;
    const lon = locationResponse.data.longitude;

    if (!lat || !lon) {
      throw new Error('Unable to determine location coordinates');
    }

    // Fetch weather from OpenWeatherMap
    const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHERMAP_API_KEY}`);
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
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
