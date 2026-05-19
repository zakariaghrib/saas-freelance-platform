import { useState, useEffect } from 'react';
// MODIFIÉ : On a ajouté l'icône Download
import { Plus, Trash2, X, FileText, DollarSign, Tag, User, Edit, Download } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Factures() {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    reference: '', montant: '', statut: 'EN_ATTENTE', clientId: ''
  });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [facturesRes, clientsRes] = await Promise.all([
        api.get('/factures'),
        api.get('/clients')
      ]);
      setFactures(facturesRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des données", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (facture) => {
    setFormData({
      reference: facture.reference,
      montant: facture.montant,
      statut: facture.statut,
      clientId: facture.client ? facture.client.id : ''
    });
    setEditingId(facture.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ reference: '', montant: '', statut: 'EN_ATTENTE', clientId: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      reference: formData.reference,
      montant: parseFloat(formData.montant),
      statut: formData.statut,
      client: { id: parseInt(formData.clientId) } 
    };

    try {
      if (editingId) {
        await api.put(`/factures/${editingId}`, payload);
      } else {
        await api.post('/factures', payload);
      }
      closeModal();
      fetchData();
    } catch (err) {
      setError(err.response?.data || "Une erreur s'est produite.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette facture ?")) {
      try {
        await api.delete(`/factures/${id}`);
        fetchData();
      } catch (err) {
        console.error("Erreur lors de la suppression", err);
      }
    }
  };

  // NOUVEAU : Fonction pour télécharger le PDF de manière sécurisée (avec le Token)
  const handleDownloadPdf = async (id, reference) => {
    try {
      // On demande le PDF à Spring Boot
      const response = await api.get(`/factures/${id}/pdf`, {
        responseType: 'blob', // Très important pour les fichiers binaires !
      });

      // On crée un lien temporaire pour forcer le téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${reference}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // On nettoie le navigateur
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF", err);
      alert("Impossible de télécharger la facture. Vérifiez que le serveur est bien lancé.");
    }
  };

  const getStatusBadge = (statut) => {
    switch(statut) {
      case 'PAYEE': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">PAYÉE</span>;
      case 'EN_ATTENTE': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">EN ATTENTE</span>;
      case 'ANNULEE': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">ANNULÉE</span>;
      default: return <span>{statut}</span>;
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">
            Facturation
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos revenus et l'état de vos paiements.</p>
        </div>
        <button 
          onClick={() => { closeModal(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Nouvelle Facture
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Référence</th>
                <th className="p-4">Client</th>
                <th className="p-4">Montant</th>
                <th className="p-4">Statut</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {factures.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Aucune facture enregistrée.
                  </td>
                </tr>
              ) : (
                factures.map((facture) => (
                  <tr key={facture.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{facture.reference}</td>
                    <td className="p-4 text-gray-600">
                      {facture.client ? facture.client.nomComplet : '-'}
                    </td>
                    <td className="p-4 font-black text-gray-900">{facture.montant} MAD</td>
                    <td className="p-4">{getStatusBadge(facture.statut)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        
                        {/* NOUVEAU BOUTON : Télécharger le PDF */}
                        <button 
                          onClick={() => handleDownloadPdf(facture.id, facture.reference)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Télécharger le PDF"
                        >
                          <Download size={18} />
                        </button>

                        <button 
                          onClick={() => handleEditClick(facture)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier le statut"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(facture.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-black italic tracking-tight uppercase">
                {editingId ? 'Modifier la facture' : 'Créer une facture'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Référence *</label>
                <div className="relative">
                  <FileText size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input required name="reference" value={formData.reference} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="FAC-2026-001" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Client *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <select required name="clientId" value={formData.clientId} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black appearance-none">
                    <option value="" disabled>Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.nomComplet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Montant (MAD) *</label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input required type="number" step="0.01" name="montant" value={formData.montant} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="5000.00" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Statut *</label>
                <div className="relative">
                  <Tag size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <select required name="statut" value={formData.statut} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black appearance-none border-l-4 border-l-gray-900">
                    <option value="EN_ATTENTE">En Attente</option>
                    <option value="PAYEE">Payée</option>
                    <option value="ANNULEE">Annulée</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-black transition-all">
                  {editingId ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}