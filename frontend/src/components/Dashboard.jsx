import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; // 1. ON IMPORTE NOTRE ASSISTANT ICI !

export default function Dashboard() {
  const navigate = useNavigate();
  
  // On crée un state pour stocker les données secrètes qu'on va recevoir
  const [secretData, setSecretData] = useState(null);
  const [error, setError] = useState('');

  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return; // On arrête tout si pas de token
    }

    // 2. C'EST ICI QU'ON UTILISE LE CODE !
    // On appelle notre route protégée. L'assistant (api) va automatiquement 
    // ajouter le Token JWT dans la requête.
    const fetchSecureData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setSecretData(response.data); // On sauvegarde les données reçues
      } catch (err) {
        console.error("Erreur d'accès", err);
        setError("Accès refusé. Votre session est peut-être expirée.");
        // Si le token est faux ou expiré, on jette l'utilisateur dehors
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchSecureData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mt-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">
            Dashboard
          </h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition-colors"
          >
            Se déconnecter
          </button>
        </div>
        
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 mb-6">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Bienvenue !</h2>
          <p className="text-blue-800">
            Vous êtes connecté en tant que : <span className="font-black bg-blue-200 px-2 py-1 rounded">{userRole}</span>
          </p>
        </div>

        {/* 3. ON AFFICHE LES DONNÉES SECRÈTES DU BACKEND */}
        {error && <p className="text-red-500 font-bold">{error}</p>}
        
        {secretData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-bold text-lg">{secretData.message}</p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm font-bold uppercase">Chiffre d'Affaires</p>
              <p className="text-3xl font-black mt-1">{secretData.chiffreAffaires}</p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <p className="text-gray-500 text-sm font-bold uppercase">Nouveaux Clients</p>
              <p className="text-3xl font-black mt-1">{secretData.nouveauxClients}</p>
            </div>
          </div>
        ) : (
          !error && <p className="text-gray-500 animate-pulse">Chargement des données sécurisées...</p>
        )}

      </div>
    </div>
  );
}