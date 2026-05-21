import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importation des Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients'; // <-- Notre nouvelle page !
import Factures from './pages/Factures';
import MonProjet from './pages/MonProjet';
import Facturation from './pages/Factures';
// Importation des Composants de structure
import Layout from './components/Layout';
import ProjetDetail from './pages/ProjetDetail';
import Parametres from './pages/Parametres';

function App() {
  return (
    <Router>
      <Routes>
        {/* =========================================
            ROUTES PUBLIQUES (Page entière, sans menu) 
            ========================================= */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* =========================================
            ROUTES PROTÉGÉES (À l'intérieur du Layout / Sidebar) 
            ========================================= */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/factures" element={<Factures />} />
          <Route path="/mon-projet" element={<MonProjet />} />
          <Route path="/projets/:id" element={<ProjetDetail />} />
          <Route path="/mes-factures" element={<Factures   />} />
          <Route path="/parametres" element={<Parametres />} />

          {/* Plus tard, nous ajouterons les autres pages ici, par exemple : */}
          {/* <Route path="/factures" element={<Factures />} /> */}
          {/* <Route path="/parametres" element={<Parametres />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;