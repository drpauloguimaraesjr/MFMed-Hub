import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Admin from './pages/Admin';
import founderImg from './assets/founder.jpeg';
import './index.css';

function App() {
  return (
    <Router>
      <div
        className="app-wrapper"
      >
        <Routes>
          {/* Rota principal (Visitantes / Captação de Leads) */}
          <Route path="/" element={<Landing />} />
          <Route path="/cadastro" element={<Landing />} />

          {/* Rota de Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas (Para quem tem conta) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
