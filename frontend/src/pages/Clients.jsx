import { useState, useEffect } from 'react';
import { Briefcase, Check, X, RefreshCw, ChevronRight } from 'lucide-react';
import api from '../api/axiosConfig';

export default function ProjetsFreelance() {
  const [projets, setProjets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAvancement, setEditingAvancement] = useState({}); // Pour stocker les valeurs temporaires des jauges

  const fetchProjets = async () => {
    try {
      const response = await api.get('/projets');
      setProjets(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des projets", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjets();
  }, []);

  // --- 1. RÉPONDRE À UNE INVITATION (ACCEPTER / REFUSER) ---
  const handleReponse = async (projetId, reponse) => {
    try {
      await api.put(`/projets/${projetId}/reponse?reponse=${reponse}`);
      alert(`Vous avez ${reponse === 'ACCEPTE' ? 'accepté' : 'refusé'} la collaboration !`);
      fetchProjets(); // Rafraîchit la liste
    } catch (error) {
      console.error("Erreur lors de la réponse :", error);
      alert("Une erreur est survenue.");
    }
  };

  // --- 2. MODIFIER L'AVANCEMENT D'UN PROJET ---
  const handleAvancementChange = (projetId, value) => {
    setEditingAvancement({ ...editingAvancement, [projetId]: value });
  };

  const handleUpdateAvancement = async (projet) => {
    const nouvelAvancement = editingAvancement[projet.id];
    if (nouvelAvancement === undefined || nouvelAvancement === "") return;

    try {
      const projetMisAJour = {
        ...projet,
        avancement: parseInt(nouvelAvancement)
      };
      
      await api.put(`/projets/${projet.id}`, projetMisAJour);
      alert("Avancement mis à jour !");
      fetchProjets();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Impossible de modifier l'avancement.");
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-400 font-medium animate-pulse">Chargement de vos projets...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* EN-TÊTE */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Briefcase className="text-blue-600" />
          Espace de Pilotage Freelance
        </h1>
        <p className="text-slate-500 mt-1">Gérez vos contrats, acceptez de nouvelles missions et pilotez l'avancement en direct.</p>
      </div>

      {/* TABLEAU DE BORD PRINCIPAL */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-400 uppercase tracking-wider font-bold">
              <th className="p-5">Projet / Besoin</th>
              <th className="p-5">Client</th>
              <th className="p-5">Statut Association</th>
              <th className="p-5 text-right">Actions / Avancement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {projets.map((projet) => (
              <tr key={projet.id} className="hover:bg-slate-50/50 transition-colors">
                
                {/* COLONNE INFO PROJET */}
                <td className="p-5 max-w-xs">
                  <div className="font-bold text-slate-900 text-base mb-1">{projet.titre}</div>
                  <div className="text-slate-500 line-clamp-2 text-xs leading-relaxed">{projet.description}</div>
                </td>
                
                {/* COLONNE INFO CLIENT */}
                <td className="p-5">
                  <div className="font-semibold text-slate-700">{projet.client?.nomComplet}</div>
                  <div className="text-slate-400 text-xs">{projet.client?.email}</div>
                </td>

                {/* COLONNE STATUT DE LA DEMANDE */}
                <td className="p-5">
                  {projet.statutDemande === 'EN_ATTENTE' && (
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
                      Demande Reçue
                    </span>
                  )}
                  {projet.statutDemande === 'ACCEPTE' && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                      Mission Validée
                    </span>
                  )}
                  {projet.statutDemande === 'REFUSE' && (
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold border border-rose-200">
                      Refusée
                    </span>
                  )}
                  {!projet.statutDemande && (
                    <span className="text-slate-400 text-xs italic">Aucune liaison en cours</span>
                  )}
                </td>

                {/* COLONNE DYNAMIQUE D'ACTION */}
                <td className="p-5 text-right">
                  
                  {/* CAS 1 : C'est une demande en attente -> On affiche Accepter/Refuser */}
                  {projet.statutDemande === 'EN_ATTENTE' && (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleReponse(projet.id, 'ACCEPTE')}
                        className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        <Check size={14} /> Accepter
                      </button>
                      <button 
                        onClick={() => handleReponse(projet.id, 'REFUSE')}
                        className="flex items-center gap-1 bg-white border border-slate-200 text-rose-600 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-rose-50 transition-all"
                      >
                        <X size={14} /> Décliner
                      </button>
                    </div>
                  )}

                  {/* CAS 2 : La mission est acceptée -> On donne le contrôle sur le % d'avancement */}
                  {projet.statutDemande === 'ACCEPTE' && (
                    <div className="flex items-center justify-end gap-3">
                      <div className="flex items-center gap-1.5">
                        <input 
                          type="number" 
                          min="0" 
                          max="100"
                          placeholder={projet.avancement}
                          value={editingAvancement[projet.id] !== undefined ? editingAvancement[projet.id] : ''}
                          onChange={(e) => handleAvancementChange(projet.id, e.target.value)}
                          className="w-16 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="font-bold text-slate-400 text-xs">%</span>
                      </div>
                      <button 
                        onClick={() => handleUpdateAvancement(projet)}
                        className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Enregistrer l'avancement"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  )}

                  {/* CAS OÙ LE PROJET N'EST PAS ENCORE LIÉ */}
                  {projet.statutDemande !== 'EN_ATTENTE' && projet.statutDemande !== 'ACCEPTE' && (
                    <span className="text-slate-400 text-xs">-</span>
                  )}
                </td>

              </tr>
            ))}
            {projets.length === 0 && (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-400 font-medium">Aucune demande ni aucun projet sur la plateforme.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}