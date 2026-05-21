import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, AlertCircle, Plus, X, Trash2, UserPlus, MessageSquare } from 'lucide-react';
import api from '../api/axiosConfig';

export default function MonProjet() {
  const [projets, setProjets] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFreelancers, setSelectedFreelancers] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ titre: '', description: '' });

  const loadData = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) throw new Error("Email introuvable");

      const responseProjets = await api.get(`/projets/mon-projet?email=${email}`);
      setProjets(responseProjets.data);

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

  const handleAssignFreelancer = async (projetId) => {
    const freelancerId = selectedFreelancers[projetId];
    if (!freelancerId) {
      alert("Veuillez sélectionner un Freelancer dans la liste.");
      return;
    }

    try {
      await api.put(`/projets/${projetId}/assigner/${freelancerId}`);
      alert("Demande d'association envoyée avec succès !");
      loadData(); 
    } catch (error) {
      console.error("Erreur lors de l'assignation :", error);
      alert("Impossible d'envoyer la demande.");
    }
  };

  const handleSelectChange = (projetId, freelancerId) => {
    setSelectedFreelancers({ ...selectedFreelancers, [projetId]: freelancerId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-sm">
          Chargement de votre espace...
        </div>
      </div>
    );
  }

  const getStatusConfig = (statut) => {
    switch(statut) {
      case 'TERMINE': return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle, label: 'Terminé' };
      case 'EN_PAUSE': return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle, label: 'En Pause' };
      default: return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: Clock, label: 'En Cours' };
    }
  };

  return (
    // L'arrière-plan luxueux et la largeur harmonisée
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 bg-stone-50/30 min-h-screen">
      
      {/* EN-TÊTE ÉLÉGANT */}
      <div className="border-b border-slate-200 pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase font-serif flex items-center gap-3">
            <Briefcase className="text-blue-600" size={32} />
            Mes Projets & Collaborations
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Gérez vos projets et associez-vous avec les meilleurs experts.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-sm text-sm"
        >
          <Plus size={18} />
          Nouveau Projet
        </button>
      </div>

      {projets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <Briefcase size={48} className="text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Aucun projet</h2>
          <p className="text-slate-500 mt-2 text-sm mb-6">Vous n'avez pas encore créé de projet sur la plateforme.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm">
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projets.map((projet) => {
            const statusConfig = getStatusConfig(projet.statut);
            const StatusIcon = statusConfig.icon;

            return (
              <div key={projet.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 transition-all hover:shadow-md">
                
                <div className="flex justify-between items-start">
                  <div>
                    {/* Le titre du projet avec une belle typo */}
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{projet.titre}</h2>
                    <p className="text-slate-600 leading-relaxed max-w-3xl text-sm">{projet.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider ${statusConfig.bg} ${statusConfig.border} ${statusConfig.color}`}>
                      <StatusIcon size={14} />
                      {statusConfig.label}
                    </div>
                    <button onClick={() => handleDelete(projet.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100" title="Supprimer le projet">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* CAS 1 : Aucun Freelancer */}
                  {!projet.freelancer && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400 shadow-sm">
                          <UserPlus size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Aucun expert associé</h4>
                          <p className="text-xs text-slate-500">Sélectionnez un profil pour lancer la collaboration.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <select 
                          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          value={selectedFreelancers[projet.id] || ""}
                          onChange={(e) => handleSelectChange(projet.id, e.target.value)}
                        >
                          <option value="">Choisir un prestataire...</option>
                          {freelancers.map((f) => (
                            <option key={f.id} value={f.id}>{f.nomComplet || f.nom || f.email}</option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleAssignFreelancer(projet.id)}
                          className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-sm shrink-0"
                        >
                          Inviter
                        </button>
                      </div>
                    </>
                  )}

                  {/* CAS 2 : En attente */}
                  {projet.freelancer && projet.statutDemande === 'EN_ATTENTE' && (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-500 shadow-sm animate-pulse">
                          <Clock size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Invitation envoyée</h4>
                          <p className="text-xs text-slate-500">
                            En attente de la réponse de <span className="font-bold text-slate-700">{projet.freelancer.nomComplet || projet.freelancer.nom || projet.freelancer.email}</span>.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider bg-amber-50 border border-amber-200 text-amber-600 px-3 py-1.5 rounded-lg">
                        En Attente
                      </span>
                    </div>
                  )}

                  {/* CAS 3 : Accepté (Avec bouton espace de travail) */}
                  {projet.freelancer && projet.statutDemande === 'ACCEPTE' && (
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-emerald-500 shadow-sm">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Partenaire Officiel</h4>
                          <p className="text-xs text-slate-500">
                            Projet piloté par <span className="font-bold text-slate-700">{projet.freelancer.nomComplet || projet.freelancer.nom || projet.freelancer.email}</span>.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 border border-emerald-200 text-emerald-600 px-3 py-1.5 rounded-lg">
                          Lié
                        </span>
                        
                        <Link 
                          to={`/projets/${projet.id}`}
                          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
                        >
                          <MessageSquare size={16} /> Espace de travail
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* BARRE D'AVANCEMENT STYLISÉE */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avancement Global</h3>
                    <span className="text-2xl font-black text-slate-800 tracking-tighter">{projet.avancement}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden relative border border-slate-200/50">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${projet.avancement === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
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

      {/* MODAL DE CRÉATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-serif uppercase tracking-tight">
                <Plus className="text-blue-600" size={24} />
                Nouveau Projet
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors bg-white rounded-lg p-1.5 shadow-sm border border-slate-200">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Titre du projet</label>
                <input required name="titre" value={formData.titre} onChange={handleChange} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm font-medium text-slate-800" placeholder="Ex: Refonte du site vitrine" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description des besoins</label>
                <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32 transition-all text-sm text-slate-800" placeholder="Décrivez les fonctionnalités principales attendues..."></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md">Soumettre le projet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}