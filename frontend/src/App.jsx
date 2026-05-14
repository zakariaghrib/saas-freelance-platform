import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login'; // On importe la nouvelle page

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirige la racine '/' vers '/login' */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Nos deux routes principales */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}

export default App;