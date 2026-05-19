import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    nomComplet: '', // CORRECTION ICI : nomComplet au lieu de fullName
    email: '',
    password: '',
    role: 'FREELANCER'
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', formData);
      setMessage(response.data);
      setIsError(false);
      // CORRECTION ICI AUSSI
      setFormData({ nomComplet: '', email: '', password: '', role: 'FREELANCER' });
    } catch (error) {
      setMessage(error.response?.data || "Une erreur s'est produite lors de l'inscription.");
      setIsError(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      
      {/* SECTION GAUCHE */}
      <div className="flex flex-col justify-center w-full px-8 py-12 lg:w-1/2 sm:px-16 xl:px-24 relative">
        
        <div className="mb-10 lg:absolute lg:top-8 lg:left-8 xl:left-24 lg:mb-0 flex items-center gap-2 font-bold text-xl tracking-tight cursor-default">
          <span className="text-red-500 text-2xl">✦</span> saasflow
        </div>

        <div className="w-full max-w-sm mx-auto">
          <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase leading-none mb-4">
            Votre aventure <br/> commence ici.
          </h2>
          <p className="text-gray-500 mb-8 font-medium">
            Créez un compte pour commencer.
          </p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input 
                name="nomComplet" type="text" required placeholder="Nom complet" // CORRECTION DU NAME ICI
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                value={formData.nomComplet} onChange={handleChange} // CORRECTION DU VALUE ICI
              />
            </div>

            <div>
              <input 
                name="email" type="email" required placeholder="Email"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                value={formData.email} onChange={handleChange}
              />
            </div>

            <div>
              <input 
                name="password" type="password" required placeholder="Mot de passe"
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                value={formData.password} onChange={handleChange}
              />
            </div>

            {/* Sélecteur de rôle style Switch */}
            <div className="flex gap-2 p-1 bg-gray-50 border border-gray-200 rounded-full">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'FREELANCER'})}
                className={`w-1/2 py-2.5 rounded-full text-sm font-semibold transition-all ${formData.role === 'FREELANCER' ? 'bg-white shadow-sm border border-gray-100 text-black' : 'text-gray-500 hover:text-black'}`}
              >
                Freelance
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'CLIENT'})}
                className={`w-1/2 py-2.5 rounded-full text-sm font-semibold transition-all ${formData.role === 'CLIENT' ? 'bg-white shadow-sm border border-gray-100 text-black' : 'text-gray-500 hover:text-black'}`}
              >
                Client
              </button>
            </div>

            {message && (
              <div className={`p-3 text-sm text-center rounded-2xl ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 text-sm font-bold text-white bg-gray-900 rounded-full hover:bg-black hover:shadow-lg transition-all"
              >
                Sign Up
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="font-bold text-gray-900 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

      {/* SECTION DROITE (Image) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Abstract background" 
          className="absolute inset-0 object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent mix-blend-overlay"></div>
      </div>
    </div>
  );
}