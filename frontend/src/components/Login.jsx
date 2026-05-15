import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      const { token, role } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      
      navigate('/dashboard');
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || typeof error.response?.data === 'string' ? error.response.data : "Erreur de connexion.";
      setMessage(errorMsg);
      setIsError(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* SECTION GAUCHE */}
      <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 sm:px-16 xl:px-24 relative">
        
        {/* CORRECTION RESPONSIVE ICI : mb-10 sur mobile, absolute sur écran large (lg) */}
        <div className="mb-10 lg:absolute lg:top-8 lg:left-8 xl:left-24 lg:mb-0 flex items-center gap-2 font-bold text-xl tracking-tight cursor-default">
          <span className="text-red-500 text-2xl">✦</span> saasflow
        </div>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase leading-none mb-4">
            Bon retour <br/> parmi nous.
          </h2>
          <p className="text-gray-500 mb-8 font-medium">Entrez vos identifiants pour continuer.</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input name="email" type="email" required placeholder="Email" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all" value={formData.email} onChange={handleChange} />
            </div>
            <div>
              <input name="password" type="password" required placeholder="Mot de passe" className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all" value={formData.password} onChange={handleChange} />
            </div>

            {message && (
              <div className={`p-3 text-sm text-center rounded-2xl ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message}
              </div>
            )}

            <div className="pt-2">
              <button type="submit" className="w-full py-4 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-black hover:shadow-lg transition-all">
                Log In
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Nouveau sur la plateforme ?{' '}
            <Link to="/register" className="font-bold text-gray-900 hover:underline">Sign Up</Link>
          </p>
        </div>
      </div>

      {/* SECTION DROITE (Image) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" alt="Abstract fluid background" className="absolute inset-0 object-cover w-full h-full scale-105" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay"></div>
      </div>
    </div>
  );
}