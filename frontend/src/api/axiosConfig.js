import axios from 'axios';

// 1. On crée une instance personnalisée d'Axios
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // On pointe vers notre Spring Boot
});

// 2. On ajoute l'"Assistant Personnel" (L'Intercepteur)
api.interceptors.request.use(
  (config) => {
    // On va chercher le Token dans le localStorage
    const token = localStorage.getItem('token');
    
    // Si on a un Token, on l'attache à la requête comme un Badge VIP
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; 
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;