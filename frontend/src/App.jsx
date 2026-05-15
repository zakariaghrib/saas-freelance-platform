import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Les Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Les Composants
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques (Sans Sidebar) */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées (AVEC Sidebar) */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;