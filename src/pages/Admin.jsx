import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, PlusCircle, Settings, LogOut, Video } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState([
    { id: 'm1', title: 'Módulo 1: Prática Clínica Avançada' },
    { id: 'm2', title: 'Módulo 2: Casos do Dia-a-Dia' }
  ]);

  const [uploadData, setUploadData] = useState({
    title: '',
    duration: '',
    moduleId: 'm1',
    description: ''
  });

  const [videoFile, setVideoFile] = useState(null);

  const handleVideoUpload = (e) => {
    e.preventDefault();
    if (!uploadData.title || (!videoFile && !uploadData.videoUrl)) {
      alert("Por favor, selecione um arquivo de vídeo ou insira um link.");
      return;
    }
    
    // Simulação do Upload
    console.log("Subindo vídeo para Nuvem (Ex: AWS S3 ou Firebase):", uploadData, videoFile);
    alert(`Aula "${uploadData.title}" salva com sucesso no ${modules.find(m => m.id === uploadData.moduleId)?.title}!`);
    
    setUploadData({ title: '', duration: '', moduleId: 'm1', description: '' });
    setVideoFile(null);
  };

  return (
    <div style={{ paddingBottom: '3rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar fade-in" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Settings color="#ef4444" size={24} />
          <span style={{ color: '#ef4444' }}>Painel do Professor</span>
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary" 
            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem', background: 'transparent' }}
          >
            Ver Plataforma dos Alunos
          </button>
          
          <button 
            onClick={() => navigate('/login')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </nav>

      <div className="container fade-in-delayed" style={{ flex: 1, maxWidth: '1000px', paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }}>
          
          {/* Menu de Configurações */}
          <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>Configurações</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', borderLeft: '3px solid #60a5fa' }}>
                  <UploadCloud size={20} /> Upload de Aula
                </div>
              </li>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', color: 'var(--text-light)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <PlusCircle size={20} color="var(--text-muted)" /> Adicionar Módulos
                </div>
              </li>
              <li>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', color: 'var(--text-light)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <Video size={20} color="var(--text-muted)" /> Minhas Aulas Publicadas
                </div>
              </li>
            </ul>
          </div>

          {/* Área de Upload */}
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Adicionar Nova Aula</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Preencha os dados e suba o vídeo cru para a sua plataforma.</p>
            
            <form onSubmit={handleVideoUpload}>
              <div className="form-group">
                <label>Título da Aula</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="Ex: Tratamento de Insuficiência Cardíaca"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Módulo Relacionado</label>
                  <select 
                    className="form-input" 
                    value={uploadData.moduleId}
                    onChange={(e) => setUploadData({...uploadData, moduleId: e.target.value})}
                    style={{ appearance: 'none' }}
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id} style={{ background: '#0b0f19' }}>{m.title}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Duração (minutos)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Ex: 45 min"
                    value={uploadData.duration}
                    onChange={(e) => setUploadData({...uploadData, duration: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem', border: '2px dashed var(--glass-border)', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}>
                <UploadCloud size={48} color="var(--accent-color)" style={{ marginBottom: '1rem', opacity: 0.8 }} />
                <h4 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>Arraste seu vídeo para cá (.mp4, .mov)</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ou clique no botão abaixo para selecionar do seu computador.</p>
                
                <label className="btn" style={{ width: 'auto', padding: '0.6rem 2rem' }}>
                  <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    style={{ display: 'none' }}
                    onChange={(e) => setVideoFile(e.target.files[0])}
                  />
                  Selecionar Vídeo Local
                </label>
                {videoFile && (
                  <div style={{ marginTop: '1rem', color: '#10b981', fontSize: '0.95rem', fontWeight: '500', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <Video size={16} /> Arquivo Selecionado: {videoFile.name} (Pronto para Upload)
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'var(--text-muted)' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
                <span style={{ padding: '0 1rem', fontSize: '0.85rem' }}>OU COLE UM LINK SEGURO (MUITO RECOMENDADO)</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }}></div>
              </div>

              <div className="form-group">
                <label>Link externo (Vimeo ou YouTube não listado)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="https://vimeo.com/seuvideo"
                  value={uploadData.videoUrl || ''}
                  onChange={(e) => setUploadData({...uploadData, videoUrl: e.target.value})}
                />
              </div>

              <button type="submit" className="btn" style={{ marginTop: '1rem', height: '54px', fontSize: '1.1rem', background: '#10b981', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
                <UploadCloud size={20} /> Salvar e Publicar Aula no Módulo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
