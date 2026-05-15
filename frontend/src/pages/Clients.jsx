import { useState, useEffect } from 'react';
// NOUVEAU : On importe l'icône Edit (le crayon)
import { Plus, Trash2, X, Building2, Phone, Mail, User, Edit } from 'lucide-react';
import api from '../api/axiosConfig';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // NOUVEAU : Un état pour savoir si on est en train de modifier (et quel ID)
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nomComplet: '', email: '', entreprise: '', telephone: ''
  });
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des clients", err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // NOUVEAU : Fonction pour ouvrir le modal en mode "Modification"
  const handleEditClick = (client) => {
    setFormData({
      nomComplet: client.nomComplet,
      email: client.email,
      entreprise: client.entreprise || '',
      telephone: client.telephone || ''
    });
    setEditingId(client.id); // On mémorise l'ID du client à modifier
    setIsModalOpen(true);
  };

  // NOUVEAU : Fonction pour réinitialiser et fermer le modal proprement
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nomComplet: '', email: '', entreprise: '', telephone: '' });
    setError('');
  };

  // MODIFIÉ : Gère à la fois la Création et la Modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        // Mode MODIFICATION : On appelle PUT avec l'ID
        await api.put(`/clients/${editingId}`, formData);
      } else {
        // Mode CRÉATION : On appelle POST
        await api.post('/clients', formData);
      }
      closeModal();
      fetchClients();
    } catch (err) {
      setError(err.response?.data || "Une erreur s'est produite.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce client ?")) {
      try {
        await api.delete(`/clients/${id}`);
        fetchClients();
      } catch (err) {
        console.error("Erreur lors de la suppression", err);
      }
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">
            Répertoire Clients
          </h1>
          <p className="text-gray-500 mt-1">Gérez vos contacts et entreprises partenaires.</p>
        </div>
        <button 
          onClick={() => { closeModal(); setIsModalOpen(true); }} // Force le mode création
          className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          Nouveau Client
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Nom Complet</th>
                <th className="p-4">Entreprise</th>
                <th className="p-4">Contact</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    Aucun client pour le moment.
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{client.nomComplet}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 size={16} className="text-gray-400" />
                        {client.entreprise || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col text-sm">
                        <span className="flex items-center gap-2 text-gray-900">
                          <Mail size={14} className="text-gray-400" /> {client.email}
                        </span>
                        <span className="flex items-center gap-2 text-gray-500 mt-1">
                          <Phone size={14} className="text-gray-400" /> {client.telephone || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* NOUVEAU BOUTON : Modifier */}
                        <button 
                          onClick={() => handleEditClick(client)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <button 
                          onClick={() => handleDelete(client.id)}
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
              {/* Le titre change selon le mode ! */}
              <h2 className="text-xl font-black italic tracking-tight uppercase">
                {editingId ? 'Modifier le client' : 'Ajouter un client'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nom Complet *</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input required name="nomComplet" value={formData.nomComplet} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all" placeholder="Jean Dupont" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email *</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all" placeholder="jean@exemple.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Entreprise</label>
                <div className="relative">
                  <Building2 size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input name="entreprise" value={formData.entreprise} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all" placeholder="Nom de la société" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Téléphone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-3.5 text-gray-400" />
                  <input name="telephone" value={formData.telephone} onChange={handleChange} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all" placeholder="+212 6..." />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all">
                  Annuler
                </button>
                <button type="submit" className="flex-1 py-3 text-sm font-bold text-white bg-gray-900 rounded-xl hover:bg-black hover:shadow-lg transition-all">
                  {/* Le texte du bouton change aussi ! */}
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