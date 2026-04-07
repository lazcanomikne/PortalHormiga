
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5973/api'
});

console.log('Testing /dataapp/clientes');
// We can't actually call it but we can see the config
const request = api.get('/dataapp/clientes');
// Catch the error but check the internal request URL if possible
// Since we are in Node, we can't easily see it without a real call or interceptor.

api.interceptors.request.use(config => {
    console.log('Final URL:', config.url);
    console.log('Full URL:', axios.getUri(config));
    return Promise.reject('cancel'); // Stop here
});

api.get('/dataapp/clientes').catch(() => {});
