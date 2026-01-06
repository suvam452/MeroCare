import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL='http://10.0.2.2:8000';

const api=axios.create({
  baseURL:BASE_URL,
  headers:{'Content-Type':'application/json'}
});

api.interceptors.request.use(
    async (config)=>{
        const token=await AsyncStorage.getItem('userToken');
        if(token){
            config.headers.Authorization='Bearer ${token}';
        }
        return config;
    },
    (error)=>Promise.reject(error)
);

export default api;