import axios from 'axios';

const fetchAxios = axios.create({
   baseURL: 'http://localhost:8000/api',
   withCredentials: true
});

export default fetchAxios;