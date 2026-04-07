
const axios = require('axios');

async function testApi() {
  try {
    const code = '436';
    const response = await axios.get('http://localhost:5973/api/dataapp/codigosconstruccion', { params: { code } });
    console.log('Response status:', response.status);
    console.log('Response data length:', response.data.length);
    console.log('First item:', response.data[0]);
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

testApi();
