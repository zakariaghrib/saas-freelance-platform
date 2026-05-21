import { useState, useEffect } from 'react';
import { Settings, User, Building, MapPin, Phone, Save, Shield } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Parametres() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomComplet: '',
    telephone: '',
    nomEntreprise: '',
    adresse: ''
  });

  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole') || 'CLIENT';

  // Dans la prochaine étape, nous ferons un vrai fetch depuis le Backend
  useEffect(() => {
    // Simulation de chargement des données existantes
    // fetchData(); 
  }, [userEmail]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Nous allons bientôt créer cette route dans le Backend (Spring Boot)
      // await api.put(`/users/profile?email=${userEmail}`, formData);
      
      setTimeout(() => {
        alert("Vos paramètres ont été mis à jour avec succès !");
        setIsLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Erreur de sauvegarde", error);
      alert("Une erreur est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 bg-stone-50/30 min-h-screen">
      
      {/* EN-TÊTE */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase font-serif flex items-center gap-3">
          <Settings className="text-slate-700" size={32} />
          Configuration
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Gérez vos informations personnelles et vos coordonnées de facturation.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* SECTION 1 : INFORMATIONS PERSONNELLES */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <User className="text-blue-600" size={20} />
            Informations Personnelles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Adresse Email (Identifiant)</label>
              <input 
                type="email" 
                disabled 
                value={userEmail} 
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed" 
              />
              <p className="text-[10px] text-slate-400 mt-1">L'adresse email ne peut pas être modifiée.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nom Complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-slate-400" />
                </div>
                <input 
                  type="text" 
                  name="nomComplet"
                  value={formData.nomComplet}
                  onChange={handleChange}
                  placeholder="Ex: Zakaria G."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium text-slate-800" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Numéro de Téléphone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={16} className="text-slate-400" />
                </div>
                <input 
                  type="tel" 
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+212 6 XX XX XX XX"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium text-slate-800" 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Rôle sur la plateforme</label>
              <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 flex items-center gap-2">
                <Shield size={16} />
                {userRole}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 : DÉTAILS DE FACTURATION */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Building className="text-blue-600" size={20} />
            Coordonnées de Facturation
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Ces informations apparaîtront officiellement sur les factures PDF générées par le système.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                {userRole === 'CLIENT' ? 'Nom de l\'Entreprise (Optionnel)' : 'Nom ou Statut Légal'}
              </label>
              <input 
                type="text" 
                name="nomEntreprise"
                value={formData.nomEntreprise}
                onChange={handleChange}
                placeholder={userRole === 'CLIENT' ? 'Ex: Tech Solutions SARL' : 'Ex: Freelance Indépendant'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium text-slate-800" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Adresse Postale Complète</label>
              <div className="relative">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <MapPin size={16} className="text-slate-400" />
                </div>
                <textarea 
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Numéro, Rue, Code Postal, Ville, Pays"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 transition-all text-sm font-medium text-slate-800" 
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* BOUTON DE SAUVEGARDE */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isLoading}
            className={`flex items-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-all shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <Save size={18} />
            {isLoading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
          </button>
        </div>

      </form>
    </div>
  );
}       