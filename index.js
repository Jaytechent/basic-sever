const express = require('express');
const axios = require('axios');
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

    res.json({
      client_ip: clientIp,
      location: location,
      greeting: `Hello, ${visitorName}!, the temperature is 11 degrees Celsius in ${location}`
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to determine location' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
