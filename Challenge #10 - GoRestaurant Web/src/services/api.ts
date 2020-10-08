import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === 'production'
      ? 'https://my-json-server.typicode.com/rafacdomin/gorestaurant-web'
      : 'http://localhost:3333',
});

export default api;
