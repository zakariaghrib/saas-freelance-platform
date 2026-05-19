import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
// MODIFICATION : Ajout de Briefcase pour le menu du client
import { LayoutDashboard, Users, FileText, Settings, LogOut, Menu, X, PanelLeftClose, PanelLeftOpen, Briefcase } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // MODIFICATION : On récupère le rôle et le nom
  const userRole = localStorage.getItem('userRole') || 'CLIENT';
  const userName = localStorage.getItem('userName') || 'Utilisateur';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.clear(); // On nettoie tout d'un coup
    navigate('/login');
  };

  const navItemClass = (path) => `
    flex items-center py-3 rounded-xl text-sm font-medium transition-all
    ${location.pathname === path 
      ? 'bg-gray-900 text-white shadow-md' 
      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}
    ${isDesktopCollapsed ? 'justify-center px-0 mx-2' : 'gap-3 px-4'}
  `;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        ${isDesktopCollapsed ? 'md:w-20' : 'md:w-64'} 
      `}>
        <div className={`h-20 flex items-center border-b border-gray-100 ${isDesktopCollapsed ? 'justify-center' : 'justify-between px-6'}`}>
          {!isDesktopCollapsed && (
            <div className="flex items-center">
              <span className="text-red-500 text-2xl mr-2">✦</span>
              <span className="font-bold text-xl tracking-tight text-gray-900">saasflow</span>
            </div>
          )}
          
          {isDesktopCollapsed && <span className="text-red-500 text-2xl">✦</span>}

          <button 
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="hidden md:block text-gray-400 hover:text-gray-900 focus:outline-none transition-colors"
            title={isDesktopCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {isDesktopCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>

          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu de navigation */}
        <nav className="flex-1 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
          
          {!isDesktopCollapsed ? (
            <p className="px-6 text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 mt-2">Menu Principal</p>
          ) : (
            <div className="border-t border-gray-100 my-4 mx-4"></div>
          )}
          
          <div className="px-2 space-y-1">
            {/* COMMUN : Le Dashboard */}
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/dashboard')} title="Dashboard">
              <LayoutDashboard size={20} className="shrink-0" />
              {!isDesktopCollapsed && <span>Dashboard</span>}
            </Link>

            {/* --- ZONE FREELANCER UNIQUEMENT --- */}
            {userRole === 'FREELANCER' && (
              <>
                <Link to="/clients" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/clients')} title="Clients">
                  <Users size={20} className="shrink-0" />
                  {!isDesktopCollapsed && <span>Clients</span>}
                </Link>
                <Link to="/factures" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/factures')} title="Facturation">
                  <FileText size={20} className="shrink-0" />
                  {!isDesktopCollapsed && <span>Facturation</span>}
                </Link>
              </>
            )}

            {/* --- ZONE CLIENT UNIQUEMENT --- */}
            {userRole === 'CLIENT' && (
              <>
                <Link to="/mon-projet" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/mon-projet')} title="Mon Projet">
                  <Briefcase size={20} className="shrink-0" />
                  {!isDesktopCollapsed && <span>Mon Projet</span>}
                </Link>
                <Link to="/mes-factures" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/mes-factures')} title="Mes Factures">
                  <FileText size={20} className="shrink-0" />
                  {!isDesktopCollapsed && <span>Mes Factures</span>}
                </Link>
              </>
            )}
          </div>
          
          {!isDesktopCollapsed ? (
            <p className="px-6 text-xs font-bold tracking-wider text-gray-400 uppercase mb-4 mt-8">Configuration</p>
          ) : (
            <div className="border-t border-gray-100 my-4 mx-4"></div>
          )}
          
          <div className="px-2">
            <Link to="/parametres" onClick={() => setIsMobileMenuOpen(false)} className={navItemClass('/parametres')} title="Paramètres">
              <Settings size={20} className="shrink-0" />
              {!isDesktopCollapsed && <span>Paramètres</span>}
            </Link>
          </div>
        </nav>

        {/* Profil & Déconnexion */}
        <div className="p-4 border-t border-gray-100">
          {!isDesktopCollapsed && (
            <div className="px-4 py-3 mb-2 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
              {/* Affichage du nom et du rôle */}
              <p className="text-xs text-gray-500 truncate">{userName}</p>
              <p className="text-sm font-black text-gray-900 truncate">{userRole}</p>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            title="Se déconnecter"
            className={`flex items-center w-full py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors ${isDesktopCollapsed ? 'justify-center px-0' : 'gap-3 px-4'}`}
          >
            <LogOut size={20} className="shrink-0" />
            {!isDesktopCollapsed && <span>Se déconnecter</span>}
          </button>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* ZONE CENTRALE DYNAMIQUE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header Mobile */}
        <header className="md:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 shrink-0">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold tracking-tight text-gray-900">saasflow</span>
        </header>

        {/* Contenu principal de la page */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
}