import axios from 'axios';

const instance = axios.create({
  timeout: 1000,
  url: 'http://localhost:6000',
});

export default instance;
