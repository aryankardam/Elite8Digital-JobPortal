import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://elite8digital-jobportal.onrender.com', // Your backend server
  withCredentials: true, // Optional: if using cookies or tokens
});

export default instance;
