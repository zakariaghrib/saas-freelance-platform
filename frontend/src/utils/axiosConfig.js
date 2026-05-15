import axios from 'axios';

// 1. On crée une instance personnalisée d'Axios
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Comme ça, on n'aura plus besoin de taper toute l'URL !
});

// 2. On ajoute l'"Assistant Personnel" (L'Intercepteur)
api.interceptors.request.use(
  (config) => {
    // Avant que chaque requête ne parte, on va chercher le Token dans le localStorage
    const token = localStorage.getItem('token');
    
    // Si on a un Token, on l'attache à la requête comme un Badge VIP
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // "Bearer " est le mot de passe standard pour dire "Voici mon token JWT"
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;