const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/hello', async (req, res) => {
  const visitorName = req.query.visitor_name || 'Visitor';
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  
  try {
    const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
    const location = locationResponse.data.city || 'Lagos';
    const temperature = 11; // For simplicity, using a constant value. In a real scenario, you would fetch this from a weather API.

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to determine location' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
