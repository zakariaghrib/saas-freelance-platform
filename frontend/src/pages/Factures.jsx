import { useState, useEffect } from 'react';
import { Receipt, Send, FileText, CheckCircle, AlertCircle, User } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Facturation() {
  const [projets, setProjets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prixInputs, setPrixInputs] = useState({});

  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole') || 'CLIENT';

  const fetchData = async () => {
    try {
      let data = [];
      if (userRole === 'CLIENT') {
        const res = await api.get(`/projets/mon-projet?email=${userEmail}`);
        data = res.data.filter(p => p.factureEnvoyee === true);
      } else {
        const res = await api.get('/projets');
        data = res.data.filter(p => p.freelancer?.email === userEmail && p.avancement === 100);
      }
      setProjets(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur de chargement", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchData();
  }, [userEmail, userRole]);

  // --- ACTIONS FREELANCER ---
  const handlePrixChange = (projetId, valeur) => {
    setPrixInputs({ ...prixInputs, [projetId]: valeur });
  };

  const envoyerFacture = async (projetId) => {
    const prix = prixInputs[projetId];
    if (!prix || isNaN(prix)) {
      alert("Veuillez saisir un prix valide.");
      return;
    }
    
    try {
      await api.put(`/projets/${projetId}/facturer?prix=${prix}`);
      alert("Facture envoyée au client avec succès !");
      fetchData();
    } catch (error) {
      alert("Erreur lors de l'envoi de la facture.");
    }
  };

  // --- ACTIONS CLIENT ---
  const telechargerFacture = async (projetId) => {
    try {
      const response = await api.get(`/projets/${projetId}/facture/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_PRJ_${projetId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      alert("Erreur lors du téléchargement de la facture.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-sm">
          Chargement de la facturation...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 bg-stone-50/30 min-h-screen">
      
      {/* EN-TÊTE ÉLÉGANT */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase font-serif flex items-center gap-3">
          <Receipt className="text-blue-600" size={32} />
          Centre de Facturation
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          {userRole === 'CLIENT' 
            ? "Consultez et téléchargez les factures envoyées par vos prestataires." 
            : "Générez et envoyez les factures pour vos projets terminés."}
        </p>
      </div>

      {projets.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center flex flex-col items-center justify-center min-h-[40vh]">
          <Receipt size={48} className="text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-700">Aucune facture disponible</h2>
          <p className="text-slate-500 mt-2 text-sm mb-6">
            {userRole === 'CLIENT' ? "Vos prestataires ne vous ont pas encore envoyé de facture." : "Vous n'avez aucun projet terminé à facturer."}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projets.map((projet) => (
            <div key={projet.id} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6 transition-all hover:shadow-md">
              
              {/* HAUT DE LA CARTE : INFO PROJET */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2 uppercase">FACTURE #{projet.id}</h2>
                  <p className="text-slate-600 leading-relaxed text-sm font-medium">{projet.titre}</p>
                </div>
                
                <div className="flex items-center gap-3 shrink-0">
                  {projet.factureEnvoyee ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider bg-emerald-50 border-emerald-200 text-emerald-600">
                      <CheckCircle size={14} /> Facturée
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider bg-amber-50 border-amber-200 text-amber-600 animate-pulse">
                      <AlertCircle size={14} /> À Facturer
                    </div>
                  )}
                </div>
              </div>

              {/* BAS DE LA CARTE : INFO FINANCIÈRE ET ACTIONS */}
              <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Info Acteur */}
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-400 shadow-sm">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      {userRole === 'CLIENT' ? 'Prestataire' : 'Client'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {userRole === 'CLIENT' ? projet.freelancer?.email : projet.client?.email}
                    </p>
                  </div>
                </div>

                {/* Montant et Bouton */}
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
                  
                  {projet.factureEnvoyee ? (
                    <div className="text-right md:mr-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Montant Total</p>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">{projet.prix} MAD</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        placeholder="Ex: 5000"
                        value={prixInputs[projet.id] || ''}
                        onChange={(e) => handlePrixChange(projet.id, e.target.value)}
                        className="w-32 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-right"
                      />
                      <span className="text-slate-500 font-bold text-sm">MAD</span>
                    </div>
                  )}

                  {/* Actions */}
                  {userRole === 'FREELANCER' && !projet.factureEnvoyee && (
                    <button 
                      onClick={() => envoyerFacture(projet.id)}
                      className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md w-full md:w-auto"
                    >
                      <Send size={18} /> Envoyer la facture
                    </button>
                  )}

                  {projet.factureEnvoyee && (
                    <button 
                      onClick={() => telechargerFacture(projet.id)}
                      className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md w-full md:w-auto"
                    >
                      <FileText size={18} /> {userRole === 'CLIENT' ? 'Télécharger le PDF' : 'Voir le PDF'}
                    </button>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}