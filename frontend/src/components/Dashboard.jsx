import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  // Ce useEffect s'exécute dès que la page s'affiche
  useEffect(() => {
    const token = localStorage.getItem('token');
    // Le "Videur" : Si pas de token, on le renvoie à la page de connexion !
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  // Fonction pour se déconnecter (on déchire le bracelet)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const userRole = localStorage.getItem('role');

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
        
        <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
          <h2 className="text-xl font-bold text-blue-900 mb-2">Bienvenue dans votre espace sécurisé !</h2>
          <p className="text-blue-800">
            Vous êtes connecté en tant que : <span className="font-black bg-blue-200 px-2 py-1 rounded">{userRole}</span>
          </p>
          <p className="mt-4 text-sm text-blue-600">
            Cette page est protégée. Si vous actualisez la page, vous restez connecté grâce à votre Token JWT sauvegardé !
          </p>
        </div>
      </div>
    </div>
  );
}