import  axios from 'axios';
const instance = axios.create({
    baseURL: 'https://ngunemay123.bsite.net/api',
  });

export default instance;