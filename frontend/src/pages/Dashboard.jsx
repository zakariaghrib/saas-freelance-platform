import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const navigate = useNavigate();
  const [secretData, setSecretData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchSecureData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setSecretData(response.data);
      } catch (err) {
        setError("Accès refusé. Votre session est peut-être expirée.");
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchSecureData();
  }, [navigate]);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">
          Vue d'ensemble
        </h1>
        <p className="text-gray-500 mt-1">Suivez l'évolution de vos activités en temps réel.</p>
      </div>

      {error && <p className="text-red-500 font-bold mb-4">{error}</p>}
      
      {secretData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3 p-6 bg-green-50 border border-green-200 rounded-2xl">
            <p className="text-green-800 font-bold">{secretData.message}</p>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Chiffre d'Affaires</p>
            <p className="text-4xl font-black mt-2 text-gray-900">{secretData.chiffreAffaires}</p>
          </div>
          
          <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Nouveaux Clients</p>
            <p className="text-4xl font-black mt-2 text-gray-900">{secretData.nouveauxClients}</p>
          </div>
        </div>
      ) : (
        !error && <p className="text-gray-500 animate-pulse font-medium">Chargement des indicateurs...</p>
      )}
    </div>
  );
}