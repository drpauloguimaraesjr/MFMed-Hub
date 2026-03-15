import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, PlayCircle, Library, Users } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    state: '',
    city: ''
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registrado:", formData);
    navigate('/dashboard');
  };

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(11, 15, 25, 0.5)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>MedClass Hub</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')} style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>
          Login (Área do Aluno)
        </button>
      </header>

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="landing-grid">
          <div className="landing-hero fade-in">
          <h1 className="title">Sua Evolução Médica, Centralizada.</h1>
          <p className="subtitle">
            Tenha acesso exclusivo a aulas de alto nível rigorosamente revisadas, materiais científicos atualizados e uma comunidade que discute casos clínicos reais direto do seu consultório.
          </p>
          
          <div className="landing-features">
            <div className="feature-item">
              <div className="feature-icon"><PlayCircle size={24} /></div>
              <span>Aulas em vídeo com experiência de plataforma premium</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Library size={24} /></div>
              <span>Repositório Inteligente que filtra dados para você</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><Users size={24} /></div>
              <span>Discussões e comentários colaborativos (Com colegas)</span>
            </div>
          </div>
        </div>
        
        <div className="glass-panel fade-in-delayed">
          <form onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: '600' }}>
              Libere seu acesso exclusivo agora
            </h2>
            
            <div className="form-group">
              <label>Nome Completo ou Nome de Apresentação</label>
              <input type="text" name="name" className="form-input" required placeholder="Ex: Dr. João Silva / Ana Beatriz" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Seu Melhor E-mail</label>
              <input type="email" name="email" className="form-input" required placeholder="medico@clinica.com.br" value={formData.email} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Telefone (WhatsApp)</label>
              <input type="tel" name="phone" className="form-input" required placeholder="(11) 99999-9999" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estado em que mora</label>
                <input type="text" name="state" className="form-input" required placeholder="Ex: SP, MG..." value={formData.state} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Cidade em que mora</label>
                <input type="text" name="city" className="form-input" required placeholder="Sua cidade atual" value={formData.city} onChange={handleChange} />
              </div>
            </div>
            
            <button type="submit" className="btn" style={{ marginTop: '1rem', height: '54px', fontSize: '1.15rem' }}>
              Acessar Módulo Científico Agora
            </button>
            
            <div className="disclaimer-text">
              <ShieldCheck className="disclaimer-icon" size={20} />
              <span>
                <strong>Atenção ao conforto:</strong> Entraremos em contato com o médico de forma comedida, sem ficar mandando e-mails de venda que enchem o saco. Seu tempo é valioso e nosso foco é na medicina.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Landing;
