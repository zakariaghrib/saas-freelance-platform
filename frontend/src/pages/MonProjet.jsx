import { useState, useEffect } from 'react';
import { Briefcase, Clock, CheckCircle, AlertCircle, Plus, X, Trash2, UserPlus } from 'lucide-react';
import api from '../api/axiosConfig';

export default function MonProjet() {
  const [projets, setProjets] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // État pour stocker le freelancer sélectionné pour chaque projet (ex: { idProjet: idFreelancer })
  const [selectedFreelancers, setSelectedFreelancers] = useState({});

  // États pour la modale d'ajout de projet
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ titre: '', description: '' });

  const loadData = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) throw new Error("Email introuvable");

      // 1. On charge les projets du client
      const responseProjets = await api.get(`/projets/mon-projet?email=${email}`);
      setProjets(responseProjets.data);

      // 2. On charge la liste des freelancers disponibles pour le menu déroulant
      const responseFreelancers = await api.get('/projets/freelancers');
      setFreelancers(responseFreelancers.data);

      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const email = localStorage.getItem('userEmail');
      const nouveauProjet = {
        titre: formData.titre,
        description: formData.description,
        clientEmail: email 
      };

      await api.post('/projets', nouveauProjet);
      setIsModalOpen(false);
      setFormData({ titre: '', description: '' });
      loadData(); 
    } catch (error) {
      alert("Une erreur s'est produite lors de la création du projet.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      try {
        await api.delete(`/projets/${id}`);
        loadData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  // --- NOUVEAU : ENVOYER LA DEMANDE D'ASSOCIATION ---
  const handleAssignFreelancer = async (projetId) => {
    const freelancerId = selectedFreelancers[projetId];
    if (!freelancerId) {
      alert("Veuillez sélectionner un Freelancer dans la liste.");
      return;
    }

    try {
      await api.put(`/projets/${projetId}/assigner/${freelancerId}`);
      alert("Demande d'association envoyée avec succès !");
      loadData(); // Rafraîchit l'interface
    } catch (error) {
      console.error("Erreur lors de l'assignation :", error);
      alert("Impossible d'envoyer la demande.");
    }
  };

  const handleSelectChange = (projetId, freelancerId) => {
    setSelectedFreelancers({ ...selectedFreelancers, [projetId]: freelancerId });
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-400 font-medium animate-pulse">Chargement de votre espace...</div>;
  }

  const getStatusConfig = (statut) => {
    switch(statut) {
      case 'TERMINE': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Terminé' };
      case 'EN_PAUSE': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle, label: 'En Pause' };
      default: return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'En Cours' };
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* EN-TÊTE */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase flex items-center gap-3">
            <Briefcase className="text-blue-600" size={28} />
            Mes Projets & Collaborations
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Gérez vos projets et associez-vous avec les meilleurs experts.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-black transition-all shadow-sm text-sm"
        >
          <Plus size={18} />
          Nouveau Projet
        </button>
      </div>

      {/* LISTE DES PROJETS */}
      {projets.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <h2 className="text-2xl font-black text-slate-800 mb-2">Aucun projet</h2>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold mt-4">Créer un projet</button>
        </div>
      ) : (
        <div className="space-y-6">
          {projets.map((projet) => {
            const statusConfig = getStatusConfig(projet.statut);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={projet.id} className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-200 space-y-6">
                
                {/* LIGNE INFO PRINCIPALE */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{projet.titre}</h2>
                    <p className="text-slate-600 leading-relaxed max-w-2xl">{projet.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-bold text-xs ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </div>
                    <button onClick={() => handleDelete(projet.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* ZONE D'ASSOCIATION AVEC LE FREELANCER */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* CAS 1 : Aucun Freelancer sélectionné du tout */}
                  {!projet.freelancer && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400 shadow-sm">
                          <UserPlus size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Aucun expert associé</h4>
                          <p className="text-xs text-slate-400">Sélectionnez un profil pour lancer la collaboration.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select 
                          className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          value={selectedFreelancers[projet.id] || ""}
                          onChange={(e) => handleSelectChange(projet.id, e.target.value)}
                        >
                          <option value="">Choisir un Freelancer...</option>
                          {freelancers.map((f) => (
                            <option key={f.id} value={f.id}>{f.nomComplet} ({f.email})</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssignFreelancer(projet.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shrink-0"
                        >
                          Inviter
                        </button>
                      </div>
                    </>
                  )}

                  {/* CAS 2 : Demande envoyée, en attente d'acceptation */}
                  {projet.freelancer && projet.statutDemande === 'EN_ATTENTE' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-500 shadow-sm animate-pulse">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Invitation envoyée</h4>
                          <p className="text-xs text-slate-500">
                            En attente de la réponse de <span className="font-bold text-slate-700">{projet.freelancer.nomComplet}</span>.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1 rounded-full">
                        En Attente
                      </span>
                    </div>
                  )}

                  {/* CAS 3 : Le Freelancer a accepté la mission */}
                  {projet.freelancer && projet.statutDemande === 'ACCEPTE' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-500 shadow-sm">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">Partenaire Officiel</h4>
                          <p className="text-xs text-slate-500">
                            Projet piloté par <span className="font-bold text-slate-700">{projet.freelancer.nomComplet}</span>.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1 rounded-full">
                        Partenaire Lié
                      </span>
                    </div>
                  )}
                </div>

                {/* BARRE D'AVANCEMENT GLOBAL */}
                <div className="mt-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avancement</h3>
                    <span className="text-2xl font-black text-slate-900">{projet.avancement}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden relative">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${projet.avancement}%` }}
                    >
                      <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent"></div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODALE D'AJOUT DE PROJET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Soumettre un projet
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors bg-white rounded-full p-1 shadow-sm border border-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Titre de votre projet</label>
                <input required name="titre" value={formData.titre} onChange={handleChange} type="text" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all shadow-sm" placeholder="Ex: Application mobile de livraison" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Description de vos besoins</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32 transition-all shadow-sm" placeholder="Décrivez les fonctionnalités principales..."></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">Créer le projet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}