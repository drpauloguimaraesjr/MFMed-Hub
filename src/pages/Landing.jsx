import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, PlayCircle, Library, Users, Loader, Calendar, ArrowRight, CheckCircle, Lock } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import drPauloImg from '../assets/mestre_paulo.jpg';

const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Etapas do funil: 'email' -> 'login' ou 'register' -> 'success'
  const [step, setStep] = useState('email'); 
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    state: '',
    city: ''
  });

  const [liveEvent, setLiveEvent] = useState(null);

  useEffect(() => {
    const fetchLiveEvent = async () => {
      try {
        const docRef = doc(db, "settings", "live_event");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLiveEvent(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar evento:", error);
      }
    };
    fetchLiveEvent();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  // 1. O usuário digita apenas o email e clica em continuar.
  const checkEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    
    setLoading(true);
    try {
      // Simulação: Procurando se esse email já está na nossa base
      const leadsRef = collection(db, "leads");
      const q = query(leadsRef, where("email", "==", formData.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Email JÁ existe -> Vai para a tela de senha (Login)
        setStep('login');
      } else {
        // Email NOVO -> Vai para a tela de captura completa (Register)
        setStep('register');
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error);
      // Fallback em caso de erro de conexão: mostrar cadastro
      setStep('register');
    } finally {
      setLoading(false);
    }
  };

  // 2. Se for um Novo Usuário, ele preenche o resto e cai aqui.
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tempPassword = Math.random().toString(36).slice(-6).toUpperCase();

      await addDoc(collection(db, "leads"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        tempPassword: tempPassword,
        createdAt: serverTimestamp()
      });

      // Envia o E-mail de Recepção/Acesso Via API Serverless
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          tempPassword: tempPassword,
          youtubeLink: liveEvent?.youtubeLink || ''
        })
      }).catch(err => console.error('Erro silencioso no disparo do e-mail:', err));

      // Ponto focal requisitado pelo usuário: A pessoa recebe um sucesso!
      setStep('success');
    } catch (error) {
      console.error("Erro ao registrar:", error);
      alert("Houve um erro no seu cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Se ele já existe, ele digita a senha e cai aqui.
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Como a integração com Firebase Auth de senha ainda não está completa,
    // simulamos um loading e mandamos direto pro Dashboard.
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="landing-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', '--hero-image': `url(${drPauloImg})` }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(11, 15, 25, 0.5)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: 0 }}>MFMed</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/login')} style={{ padding: '0.6rem 1.5rem', fontSize: '0.95rem' }}>
          Área do Aluno (Login)
        </button>
      </header>

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <div className="landing-grid">
          
          {/* LADO ESQUERDO DA TELA: PROMESSA E VALOR */}
          <div className="landing-hero fade-in">
            <h1 className="title" style={{ lineHeight: '1.2' }}>
              {liveEvent?.title || 'MFMed Hub'},<br/>
              <span style={{ fontSize: '2.8rem', color: 'var(--accent-color)', fontWeight: '600' }}>{liveEvent?.date || 'Sua Evolução Médica'}</span>
            </h1>
            <p className="subtitle">
              Tenha acesso exclusivo a aulas de alto nível rigorosamente revisadas, materiais científicos atualizados e uma comunidade que discute casos clínicos reais direto do seu consultório.
            </p>
            
            {liveEvent && liveEvent.youtubeLink && (
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '0.8rem', borderRadius: '50%', color: '#60a5fa' }}>
                  <Calendar size={28} />
                </div>
                <div>
                  <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{liveEvent.subtitle || 'Próximo evento'}</span>
                  <h3 style={{ margin: '0.5rem 0', fontSize: '1.2rem', lineHeight: '1.4', color: '#fff' }}>{liveEvent.title}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>{liveEvent.date}</p>
                </div>
              </div>
            )}

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
          
          {/* LADO DIREITO: FORMULÁRIO INTELIGENTE */}
          <div className="glass-panel fade-in-delayed" style={{ padding: '3rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
            
            {/* ETAPA 1: APENAS O EMAIL */}
            {step === 'email' && (
              <form onSubmit={checkEmail} className="fade-in">
                <h2 style={{ marginBottom: '0.5rem', fontSize: '1.6rem', fontWeight: 'bold' }}>Acessar Plataforma</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>Digite seu e-mail para participar da Aula Magna ou fazer login na sua conta.</p>
                
                <div className="form-group">
                  <label>Seu Melhor E-mail</label>
                  <input type="email" name="email" className="form-input" required placeholder="medico@clinica.com.br" value={formData.email} onChange={handleChange} autoFocus />
                </div>
                
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem', height: '54px', fontSize: '1.15rem' }}>
                  {loading ? <Loader className="animate-spin" size={24} /> : <>Continuar <ArrowRight size={20} /></>}
                </button>
              </form>
            )}

            {/* ETAPA 2 (NOVO USUÁRIO): CADASTRO COMPLETO */}
            {step === 'register' && (
              <form onSubmit={handleRegister} className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontSize: '0.9rem' }}>Novo acesso detectado para: <strong>{formData.email}</strong></span>
                </div>

                <div className="form-group">
                  <label>Nome Completo ou Nome de Apresentação</label>
                  <input type="text" name="name" className="form-input" required placeholder="Ex: Dr. João Silva / Ana Beatriz" value={formData.name} onChange={handleChange} autoFocus />
                </div>

                <div className="form-group">
                  <label>Telefone (WhatsApp)</label>
                  <input type="tel" name="phone" className="form-input" required placeholder="(11) 99999-9999" value={formData.phone} onChange={handleChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Estado</label>
                    <input type="text" name="state" className="form-input" required placeholder="SP, MG..." value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Cidade</label>
                    <input type="text" name="city" className="form-input" required placeholder="Sua cidade atual" value={formData.city} onChange={handleChange} />
                  </div>
                </div>
                
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem', height: '54px', fontSize: '1.15rem' }}>
                  {loading ? <Loader className="animate-spin" size={24} /> : 'Garantir Minha Vaga e Acesso'}
                </button>
              </form>
            )}

            {/* ETAPA 3 (USUÁRIO EXISTENTE): LOGIN COM SENHA */}
            {step === 'login' && (
              <form onSubmit={handleLogin} className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#60a5fa' }}>
                    <Lock size={28} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Bem-vindo de volta!</h2>
                  <p style={{ color: 'var(--text-muted)' }}>{formData.email}</p>
                </div>
                
                <div className="form-group">
                  <label>Sua Senha</label>
                  <input type="password" name="password" className="form-input" required placeholder="••••••••" value={formData.password} onChange={handleChange} autoFocus />
                </div>
                
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '1rem', height: '54px', fontSize: '1.15rem' }}>
                  {loading ? <Loader className="animate-spin" size={24} /> : 'Entrar na Plataforma'}
                </button>
                
                <button type="button" onClick={() => setStep('email')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1.5rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  Entrar com e-mail diferente
                </button>
              </form>
            )}

            {/* ETAPA 4: SUCESSO! */}
            {step === 'success' && (
              <div className="fade-in" style={{ textAlign: 'center', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#10b981' }}>
                  <CheckCircle size={30} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '0.8rem', color: '#fff' }}>Vaga Garantida!</h2>
                
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', width: '100%' }}>
                  <h3 style={{ color: '#ef4444', margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>⚠️ {liveEvent?.date ? `A AULA É ${liveEvent.date.toUpperCase()}` : 'AULA EM BREVE'}</h3>
                  <p style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                    Para não esquecer, clique no botão abaixo agora mesmo e ative o lembrete direto lá no YouTube:
                  </p>
                  <a href={liveEvent?.youtubeLink || '#'} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#ef4444', color: '#fff', textDecoration: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <PlayCircle size={20} /> Acessar Link do YouTube
                  </a>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                  Enviamos também as instruções de acesso oficial à plataforma para o seu e-mail. Caso já tenha uma senha validada:
                </p>
                
                <button onClick={() => setStep('login')} className="btn btn-secondary" style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', width: 'auto' }}>
                  Fazer Login na Plataforma
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
