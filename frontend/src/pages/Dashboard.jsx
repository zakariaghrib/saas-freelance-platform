import { useState, useEffect } from 'react';
import { TrendingUp, Activity, PieChart as PieChartIcon, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import api from '../api/axiosConfig';

export default function Dashboard() {
  const [projets, setProjets] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [totalProjets, setTotalProjets] = useState(0);
  const [avancementMoyen, setAvancementMoyen] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole') || 'CLIENT';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        let data = [];
        if (userRole === 'CLIENT') {
          const res = await api.get(`/projets/mon-projet?email=${userEmail}`);
          data = res.data;
        } else {
          const res = await api.get('/projets');
          data = res.data.filter(p => p.freelancer?.email === userEmail && p.statutDemande === 'ACCEPTE');
        }

        setProjets(data);
        setTotalProjets(data.length);

        // --- ANALYSE DES DONNÉES POUR LES STATS ---
        const avancementTotal = data.reduce((acc, p) => acc + (p.avancement || 0), 0);
        setAvancementMoyen(data.length > 0 ? Math.round(avancementTotal / data.length) : 0);

        // --- ANALYSE POUR LE GRAPHIQUE RECHARTS ---
        const nbTermines = data.filter(p => p.avancement === 100 || p.statut === 'TERMINE').length;
        const nbEnCours = data.filter(p => p.avancement > 0 && p.avancement < 100).length;
        const nbNouveaux = data.filter(p => p.avancement === 0).length;

        // Palette de couleurs "Entreprise"
        const chartColors = [
          { name: 'Terminés', value: nbTermines, color: '#059669' }, // Vert émeraude profond
          { name: 'En cours', value: nbEnCours, color: '#2563eb' },  // Bleu royal
          { name: 'Nouveaux', value: nbNouveaux, color: '#d97706' }  // Ambre riche
        ];

        setChartData(chartColors.filter(item => item.value > 0));
        setIsLoading(false);

      } catch (error) {
        console.error("Erreur lors du chargement du Dashboard", error);
        setIsLoading(false);
      }
    };

    if (userEmail) fetchDashboardData();
  }, [userEmail, userRole]);

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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 bg-stone-50/30 min-h-screen">
      
      {/* --- EN-TÊTE --- */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase font-serif">
          Vue d'ensemble
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Suivez l'évolution de vos projets en temps réel.</p>
      </div>

      {/* --- NOTIFICATION SUBTILE --- */}
      <div className="bg-amber-50/50 border border-amber-100/50 text-amber-900 p-4 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3">
        <Bell size={18} className="text-amber-600" />
        Synchronisation des projets réussie. Espace de travail à jour ! 🚀
      </div>

      {/* --- CARTES DE STATISTIQUES (Style Métallique/Premium) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Carte Total Projets */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all hover:shadow-lg">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Projets</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                {totalProjets}
              </h2>
              <p className="text-xs text-blue-600 font-semibold mt-2">
                Activité en cours <span className="text-slate-400 font-normal">sur la plateforme</span>
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl text-white shadow-md">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Carte Progression Moyenne */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 p-8 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] transition-all hover:shadow-lg">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Progression Globale</p>
              <h2 className="text-4xl font-black text-slate-800 tracking-tighter">
                {avancementMoyen}%
              </h2>
              <p className="text-xs text-emerald-600 font-semibold mt-2">
                Avancement moyen <span className="text-slate-400 font-normal">des missions actives</span>
              </p>
            </div>
            <div className="bg-slate-800 p-3 rounded-xl text-white shadow-md">
              <Activity size={24} />
            </div>
          </div>
        </div>

      </div>

      {/* --- SECTION DU GRAPHIQUE --- */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mt-8">
        <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
          <PieChartIcon className="text-slate-400" size={20} />
          <h3 className="text-base font-bold text-slate-700 uppercase tracking-widest">Répartition des Projets</h3>
        </div>
        
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Aucune donnée de projet pour générer le graphique.
          </div>
        ) : (
          <div className="relative h-80 w-full">
            
            {/* Le texte centré en absolu par dessus le graphique */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-black text-slate-800">{totalProjets}</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-1 text-center leading-tight">
                Projets<br/>Actifs
              </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={90}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
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