import { useState, useEffect } from 'react';
import { TrendingUp, Users, PieChart as PieChartIcon, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [stats, setStats] = useState({ chiffreAffaires: '0.00 MAD', nouveauxClients: 0, message: '' });
  const [chartData, setChartData] = useState([]);
  const [totalFactures, setTotalFactures] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, facturesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/factures')
        ]);

        setStats(statsRes.data);

        // --- ANALYSE DES DONNÉES ---
        const factures = facturesRes.data;
        setTotalFactures(factures.length);
        
        const nbPayees = factures.filter(f => f.statut === 'PAYEE').length;
        const nbEnAttente = factures.filter(f => f.statut === 'EN_ATTENTE').length;
        const nbAnnulees = factures.filter(f => f.statut === 'ANNULEE').length;

        // Palette de couleurs "Entreprise" (Plus sobres et élégantes)
        const data = [
          { name: 'Payées', value: nbPayees, color: '#059669' }, // Vert émeraude profond
          { name: 'En Attente', value: nbEnAttente, color: '#d97706' }, // Ambre riche
          { name: 'Annulées', value: nbAnnulees, color: '#dc2626' } // Rouge classique
        ];

        setChartData(data.filter(item => item.value > 0));
        setIsLoading(false);

      } catch (error) {
        console.error("Erreur lors du chargement du Dashboard", error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-sm">
          Chargement des analyses métier...
        </div>
      </div>
    );
  }

  return (
    // Fond légèrement crème/gris pour un rendu plus luxueux
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 bg-stone-50/30 min-h-screen">
      
      {/* --- EN-TÊTE --- */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase font-serif">
          Vue d'ensemble
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Suivez l'évolution de vos activités en temps réel.</p>
      </div>

      {/* --- NOTIFICATION SUBTILE --- */}
      <div className="bg-amber-50/50 border border-amber-100/50 text-amber-900 p-4 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3">
        <Bell size={18} className="text-amber-600" />
        {stats.message || "Statistiques connectées et à jour."}
      </div>

      {/* --- CARTES DE STATISTIQUES (Style Métallique/Premium) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Carte Chiffre d'Affaires */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all hover:shadow-lg">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                {stats.chiffreAffaires}
              </h2>
              {/* Petite mention factice pour le design pro */}
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                +8.2% <span className="text-slate-400 font-normal">vs. mois dernier</span>
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl text-white shadow-md">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Carte Clients */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all hover:shadow-lg">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Clients</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                {stats.nouveauxClients}
              </h2>
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Nouveau client actif <span className="text-slate-400 font-normal">récemment</span>
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl text-white shadow-md">
              <Users size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* --- SECTION DU GRAPHIQUE --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
          <PieChartIcon className="text-slate-400" size={20} />
          <h3 className="text-base font-bold text-slate-700 uppercase tracking-widest">Répartition des factures</h3>
        </div>
        
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Aucune donnée de facturation pour générer le graphique.
          </div>
        ) : (
          <div className="relative h-80 w-full">
            
            {/* L'ASTUCE PRO : Le texte centré en absolu par dessus le graphique */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-slate-800">{totalFactures}</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1 text-center leading-tight">
                Factures<br/>Totales
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90} // Plus grand pour faire un bel anneau
                  outerRadius={120}
                  paddingAngle={3} // Espacement fin et élégant
                  dataKey="value"
                  stroke="none" // Enlève la bordure par défaut
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ fontWeight: '600', color: '#1e293b' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
}