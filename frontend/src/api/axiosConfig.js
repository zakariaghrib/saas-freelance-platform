import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Adaptez le port si nécessaire
});

// L'intercepteur magique : Il s'exécute une fraction de seconde AVANT chaque requête
api.interceptors.request.use(
  (config) => {
    // On lit le token le plus récent directement dans le navigateur
    const token = localStorage.getItem('token');
    
    // Si on a un token, on l'attache au colis
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;