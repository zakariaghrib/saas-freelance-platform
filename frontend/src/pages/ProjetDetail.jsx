import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Circle, Send, MessageSquare, Calendar, Plus, Timer } from 'lucide-react';
import api from '../api/axiosConfig';

// --- Imports pour le Temps Réel ---
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function ProjetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projet, setProjet] = useState(null);
  const [taches, setTaches] = useState([]);
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [tacheInputs, setTacheInputs] = useState({}); 
  
  const monEmail = localStorage.getItem('userEmail');
  
  // Pour garder la connexion en mémoire
  const stompClientRef = useRef(null);
  // Pour scroller en bas automatiquement
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchData();
    connectWebSocket();

    // Nettoyage à la fermeture de la page
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [id]);

  // Autoscroll quand un nouveau message arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchData = async () => {
    try {
      const resProjet = await api.get(`/projets/${id}`);
      setProjet(resProjet.data);
      const resTaches = await api.get(`/projets/${id}/taches`);
      setTaches(resTaches.data);
      const resMsg = await api.get(`/projets/${id}/messages`);
      setMessages(resMsg.data);
    } catch (err) { console.error(err); }
  };

  // ==========================================
  // --- CONNEXION WEBSOCKET TEMPS RÉEL ---
  // ==========================================
  const connectWebSocket = () => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("WebSocket: " + str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connecté au Temps Réel !');
        // On s'abonne au "salon" exclusif de ce projet
        stompClient.subscribe(`/topic/projets/${id}`, (message) => {
          const messageRecu = JSON.parse(message.body);
          // MAGIE : On ajoute le message instantanément sans recharger la base
          setMessages((prevMessages) => [...prevMessages, messageRecu]);
        });
      },
      onStompError: (frame) => {
        console.error('Erreur Broker: ' + frame.headers['message']);
      }
    });

    stompClient.activate();
    stompClientRef.current = stompClient;
  };

  // ==========================================

  const definirDuree = async () => {
    const jours = prompt("Combien de jours sont nécessaires pour finaliser ce projet ?");
    if (jours && !isNaN(jours) && parseInt(jours) > 0) {
      try {
        await api.put(`/projets/${id}/duree?jours=${jours}`);
        fetchData();
      } catch (err) { alert("Erreur lors de la mise à jour de la durée."); }
    }
  };

  const handleTacheInputChange = (jour, valeur) => {
    setTacheInputs({ ...tacheInputs, [jour]: valeur });
  };

  const ajouterTacheJour = async (e, jour) => {
    e.preventDefault();
    const titreTache = tacheInputs[jour];
    if (!titreTache) return;
    
    try {
      await api.post(`/projets/${id}/taches`, { titre: titreTache, jour: jour });
      setTacheInputs({ ...tacheInputs, [jour]: "" }); 
      fetchData();
    } catch (err) { alert("Erreur d'ajout de tâche"); }
  };

  const toggleTache = async (tache) => {
    try {
      await api.put(`/projets/taches/${tache.id}`, { ...tache, terminee: !tache.terminee });
      fetchData();
    } catch (err) { alert("Erreur de mise à jour"); }
  };

  const envoyerMessage = async (e) => {
    e.preventDefault();
    if (!nouveauMessage) return;
    
    // On garde l'appel POST normal, car notre Backend se charge maintenant
    // de diffuser le message à tout le monde via le WebSocket !
    try {
      await api.post(`/projets/${id}/messages`, { contenu: nouveauMessage, expediteurEmail: monEmail });
      setNouveauMessage("");
    } catch (err) { alert("Erreur d'envoi"); }
  };

  if (!projet) return <div className="p-10 text-center text-slate-400 font-medium animate-pulse">Connexion à l'espace de travail...</div>;

  const isFreelancer = projet.freelancer?.email === monEmail;
  const joursDuProjet = Array.from({ length: projet.dureeJours || 0 }, (_, i) => i + 1);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER AMÉLIORÉ */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors">
          <ArrowLeft size={20} /> Retour
        </button>
        
        <div className="flex items-center gap-4 text-right">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase font-serif tracking-tight">{projet.titre}</h1>
            <p className="text-sm font-medium text-slate-500">
              {isFreelancer ? `Client: ${projet.client?.email}` : `Partenaire: ${projet.freelancer?.email}`}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : PLANIFICATION */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-[70vh]">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1 overflow-y-auto flex flex-col custom-scrollbar">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-slate-900 border-b border-slate-100 pb-4">
              <Calendar className="text-blue-600" size={20} />
              Planning d'exécution
            </h2>

            {!projet.dureeJours && (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center m-auto">
                <Timer size={40} className="text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 mb-2">Durée non définie</h3>
                {isFreelancer ? (
                  <>
                    <p className="text-xs text-slate-500 mb-4">Combien de jours vous faut-il pour réaliser ce projet ?</p>
                    <button onClick={definirDuree} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all w-full shadow-sm">
                      Planifier le projet
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Le Freelancer est en train d'estimer le temps nécessaire.</p>
                )}
              </div>
            )}

            {projet.dureeJours > 0 && (
              <div className="space-y-6">
                {joursDuProjet.map(jour => {
                  const tachesDuJour = taches.filter(t => t.jour === jour);

                  return (
                    <div key={jour} className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center justify-between">
                        Jour {jour}
                        <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md font-bold shadow-sm">{tachesDuJour.length} tâches</span>
                      </h3>

                      <div className="space-y-2 mb-3">
                        {tachesDuJour.map(tache => (
                          <div 
                            key={tache.id} 
                            onClick={() => toggleTache(tache)}
                            className="flex items-start gap-2 cursor-pointer group"
                          >
                            <div className="mt-0.5">
                              {tache.terminee ? <CheckCircle2 className="text-emerald-500" size={16} /> : <Circle className="text-slate-300 group-hover:text-blue-400" size={16} />}
                            </div>
                            <span className={`text-xs leading-snug ${tache.terminee ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                              {tache.titre}
                            </span>
                          </div>
                        ))}
                      </div>

                      {isFreelancer && (
                        <form onSubmit={(e) => ajouterTacheJour(e, jour)} className="flex gap-2">
                          <input 
                            value={tacheInputs[jour] || ""}
                            onChange={(e) => handleTacheInputChange(jour, e.target.value)}
                            placeholder="Nouvelle tâche..."
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button className="bg-slate-900 text-white p-1.5 rounded-lg hover:bg-black transition-colors shrink-0">
                            <Plus size={16} />
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE DROITE : MESSAGERIE TEMPS RÉEL */}
        <div className="lg:col-span-2 flex flex-col h-[70vh] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between font-bold text-slate-800 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={20} />
              Discussion
            </div>
            {/* L'indicateur est maintenant vraiment pertinent ! */}
            <span className="text-[10px] uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Live
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 flex flex-col custom-scrollbar">
            {messages.length === 0 ? (
              <div className="m-auto text-center text-slate-400 text-sm font-medium">
                Envoyez le premier message pour démarrer la conversation.
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.expediteurEmail === monEmail ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.expediteurEmail === monEmail 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                  }`}>
                    <p className={`font-bold text-[10px] uppercase tracking-widest mb-1 ${msg.expediteurEmail === monEmail ? 'text-blue-200' : 'text-slate-400'}`}>
                      {msg.expediteurEmail === monEmail ? 'Moi' : 'Partenaire'}
                    </p>
                    <div className="leading-relaxed">{msg.contenu}</div>
                  </div>
                </div>
              ))
            )}
            {/* Élément invisible pour scroller automatiquement en bas */}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={envoyerMessage} className="p-4 bg-white border-t border-slate-100 flex gap-3">
            <input 
              value={nouveauMessage}
              onChange={(e) => setNouveauMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button className="bg-slate-900 text-white px-6 rounded-2xl hover:bg-black shadow-md transition-all flex items-center justify-center">
              <Send size={20} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}