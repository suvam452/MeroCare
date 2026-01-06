import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseURL = () => {
  if (__DEV__) {
    return Platform.OS === 'android' 
      ? 'http://10.0.2.2:8000' 
      : 'http://localhost:8000';
  }
  return 'https://your-production-api.com';
};
const BASE_URL=getBaseURL();

const api=axios.create({
  baseURL:BASE_URL,
  headers:{'Content-Type':'application/json'}
});

api.interceptors.request.use(
    async (config)=>{
        const token=await AsyncStorage.getItem('userToken');
        if(token){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },
    (error)=>Promise.reject(error)
);

export default api;