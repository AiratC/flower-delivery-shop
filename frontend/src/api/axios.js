import axios from 'axios';

const fetchAxios = axios.create({
   baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
   withCredentials: true
});

export default fetchAxios;