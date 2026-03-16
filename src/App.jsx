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
        style={{ '--founder-image': `url(${founderImg})` }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cadastro" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
