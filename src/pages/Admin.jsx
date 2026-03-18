import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, PlusCircle, Settings, LogOut, Video, Megaphone, Image as ImageIcon, Copy, Download, Calendar, ArrowRight, Play } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import founderImg from '../assets/mestre_paulo.jpg';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marketing'); // 'video' | 'marketing'
  
  // -- ESTADOS DA ABA DE VÍDEO (Aulas Regulares) --
  const [modules, setModules] = useState([
    { id: 'm1', title: 'Módulo 1: Prática Clínica Avançada' },
    { id: 'm2', title: 'Módulo 2: Casos do Dia-a-Dia' }
  ]);
  const [uploadData, setUploadData] = useState({ title: '', duration: '', moduleId: 'm1', description: '', videoUrl: '' });
  const [videoFile, setVideoFile] = useState(null);

  // -- ESTADOS DA ABA DE MARKETING (Lançamento / Aulas Ao Vivo) --
  const [marketingData, setMarketingData] = useState({
    title: 'Modulação Fisiológica:',
    subtitle: 'Prescrição de testosterona, monitoramento, mitos e verdades.',
    date: 'Hoje, às 19h30',
    youtubeLink: 'https://youtube.com/live/IL4XUtEGZ_I?feature=share'
  });
  
  const [bgImage, setBgImage] = useState(founderImg);
  const feedRef = useRef(null);
  const storyRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMarketing = async () => {
    if (!marketingData.title || !marketingData.youtubeLink) {
      alert("Por favor, preencha o título e o link do YouTube.");
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, "settings", "live_event"), marketingData);
      alert("Agendamento Salvo! O link do YouTube e o aviso já estão aparecendo na plataforma para os alunos.");
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Erro de conexão ao salvar no banco de dados.");
    }
    setIsSaving(false);
  };

  const handleVideoUpload = (e) => {
    e.preventDefault();
    if (!uploadData.title || (!videoFile && !uploadData.videoUrl)) {
      alert("Por favor, selecione um arquivo de vídeo ou insira um link.");
      return;
    }
    console.log("Subindo vídeo:", uploadData, videoFile);
    alert(`Aula "${uploadData.title}" simulada com sucesso!`);
    setUploadData({ title: '', duration: '', moduleId: 'm1', description: '', videoUrl: '' });
    setVideoFile(null);
  };

  const handleMarketingImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Aviso se enviarem o .ARW
      if (file.name.toLowerCase().endsWith('.arw')) {
        alert("Atenção! Arquivos .ARW (RAW) não podem ser lidos diretamente por navegadores. Por favor, exporte sua foto do ensaio como .JPG ou .PNG e tente novamente.");
        return;
      }
      setBgImage(URL.createObjectURL(file));
    }
  };

  // Exportar imagem
  const downloadImage = async (ref, filename, scaleConfig) => {
    if (!ref.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, { 
        quality: 1, 
        pixelRatio: scaleConfig.ratio, // Para exportar num tamanho ultra hd
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Houve um erro ao renderizar a imagem.');
    }
  };

  // E-mail Template
  const emailTemplate = `Assunto: O segredo da Testosterona no Paciente Cardiovascular (Aula Magna)

Colega Médico(a),

Muitos de nós fomos ensinados a temer a reposição de testosterona em pacientes com histórico cardiovascular. Mas a ciência evoluiu, e as condutas antigas estão sendo revisadas.

Nesta ${marketingData.date}, realizarei a nossa Aula Magna Oficial de Lançamento da plataforma MFMed Hub. 

Tema: ${marketingData.title} ${marketingData.subtitle}

Nesta transmissão, farei um dissecamento completo de qual é o protocolo atual, os exames que você não pode esquecer de pedir antes de prescrever, e a conduta de longo prazo focada em segurança do paciente.

Acesse pelo link abaixo no horário marcado:
🔗 LINK DA AULA: ${marketingData.youtubeLink}

Nos vemos lá.
Dr. Paulo Guimarães Jr.`;

  return (
    <div style={{ paddingBottom: '3rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar fade-in" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Settings color="#ef4444" size={24} />
          <span style={{ color: '#ef4444' }}>Painel do Professor</span>
        </h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', gap: '0.5rem', background: 'transparent' }}>
            Ver Landing Page Real
          </button>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </nav>

      <div className="container fade-in-delayed" style={{ flex: 1, maxWidth: '1200px', paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
          
          {/* Menu de Configurações Lateral */}
          <div className="glass-panel" style={{ padding: '1.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.8rem' }}>Controle Mestre</h3>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <div 
                  onClick={() => setActiveTab('marketing')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', background: activeTab === 'marketing' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeTab === 'marketing' ? '#60a5fa' : 'var(--text-light)', borderRadius: '8px', fontWeight: '500', cursor: 'pointer', borderLeft: activeTab === 'marketing' ? '3px solid #60a5fa' : '3px solid transparent', transition: 'all 0.2s' }}>
                  <Megaphone size={20} /> Estúdio de Lançamento
                </div>
              </li>
              <li>
                <div 
                  onClick={() => setActiveTab('video')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', background: activeTab === 'video' ? 'rgba(16, 185, 129, 0.1)' : 'transparent', color: activeTab === 'video' ? '#10b981' : 'var(--text-light)', borderRadius: '8px', cursor: 'pointer', borderLeft: activeTab === 'video' ? '3px solid #10b981' : '3px solid transparent', transition: 'all 0.2s' }}>
                  <UploadCloud size={20} /> Aulas EAD (Plataforma)
                </div>
              </li>
            </ul>
          </div>

          {/* ÁREA PRINCIPAL DINÂMICA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {activeTab === 'marketing' && (
              <>
                <div className="glass-panel" style={{ padding: '2rem', borderTop: '4px solid #60a5fa' }}>
                  <h2 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Megaphone color="#60a5fa" /> Fábrica de Lançamentos
                  </h2>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)', margin: 0, maxWidth: '60%' }}>
                      Configure os dados da sua próxima aula (Ex: YouTube Live). O sistema publicará este agendamento na plataforma dos alunos e formatará os materiais de marketing.
                    </p>
                    <button onClick={handleSaveMarketing} disabled={isSaving} className="btn" style={{ width: 'auto', padding: '0.6rem 1.5rem', background: '#2563eb' }}>
                      {isSaving ? "Salvando..." : "Salvar Agendamento no Banco"}
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Título Principal da Aula Magna</label>
                      <input type="text" className="form-input" value={marketingData.title} onChange={(e) => setMarketingData({...marketingData, title: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Subtítulo ou Foco</label>
                      <input type="text" className="form-input" value={marketingData.subtitle} onChange={(e) => setMarketingData({...marketingData, subtitle: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label>Data e Horário</label>
                      <input type="text" className="form-input" placeholder="Ex: Hoje, às 19h" value={marketingData.date} onChange={(e) => setMarketingData({...marketingData, date: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Link da Transmissão (YouTube)</label>
                      <input type="url" className="form-input" placeholder="https://youtube.com/live/..." value={marketingData.youtubeLink} onChange={(e) => setMarketingData({...marketingData, youtubeLink: e.target.value})} />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ImageIcon size={18} /> Imagem do Professor (JPG ou PNG)</label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Suas fotos do ensaio (*.ARW*) precisam ser exportadas em formato leve (JPEG) antes de anexar aqui.
                    </p>
                    <input type="file" accept="image/png, image/jpeg" className="form-input" onChange={handleMarketingImageChange} style={{ padding: '0.8rem' }} />
                  </div>
                </div>

                {/* --- SEÇÃO DE PREVIEWS --- */}
                <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Arte Gerada: Redes Sociais</h3>
                <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                  
                  {/* FEED INSTAGRAM */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '350px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>Feed (1080x1080px)</span>
                      <button onClick={() => downloadImage(feedRef, 'mfmed-feed.png', {ratio: 3})} className="btn" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}><Download size={14}/> Baixar HD</button>
                    </div>
                    
                    {/* DOM Onde montamos a arte do Feed */}
                    <div ref={feedRef} style={{ width: '350px', height: '350px', position: 'relative', background: '#0b0f19', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.6 }}></div>
                      {/* Gradiente estilo cinema */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, #0b0f19 20%, transparent 80%)' }}></div>
                      
                      <div style={{ position: 'absolute', top: '20px', left: '25px', background: 'rgba(59, 130, 246, 0.2)', backdropFilter: 'blur(5px)', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Play size={12} fill="#60a5fa" /> AULA MAGNA (AO VIVO)
                      </div>

                      <div style={{ position: 'absolute', bottom: '25px', left: '25px', right: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h2 style={{ fontSize: '1.4rem', lineHeight: '1.2', margin: 0, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                          {marketingData.title} <span style={{ color: '#60a5fa', fontWeight: 'normal' }}>{marketingData.subtitle}</span>
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffcc00', fontWeight: 'bold', fontSize: '0.9rem', background: 'rgba(0,0,0,0.5)', width: 'fit-content', padding: '6px 12px', borderRadius: '6px', borderLeft: '3px solid #ffcc00' }}>
                          <Calendar size={14} /> {marketingData.date}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* STORY INSTAGRAM */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '250px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>Story (1080x1920px)</span>
                      <button onClick={() => downloadImage(storyRef, 'mfmed-story.png', {ratio: 4})} className="btn" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}><Download size={14}/> Baixar HD</button>
                    </div>
                    
                    {/* DOM Onde montamos a arte do Story */}
                    <div ref={storyRef} style={{ width: '250px', height: '444px', position: 'relative', background: '#0b0f19', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.5 }}></div>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, #0b0f19 30%, transparent 100%)' }}></div>
                      
                      <div style={{ position: 'absolute', top: '30px', width: '100%', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', background: '#ef4444', color: '#fff', padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
                          <Video size={12} /> Masterclass
                        </div>
                      </div>

                      <div style={{ position: 'absolute', bottom: '80px', left: '20px', right: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h2 style={{ fontSize: '1.25rem', lineHeight: '1.2', margin: 0, color: '#fff' }}>
                          {marketingData.title}
                        </h2>
                        <h3 style={{ fontSize: '0.9rem', margin: 0, color: '#60a5fa', fontWeight: 'normal' }}>{marketingData.subtitle}</h3>
                        
                        <div style={{ background: '#fff', color: '#000', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          <Calendar size={12} style={{ marginRight: '6px', verticalAlign: '-2px' }}/> 
                          {marketingData.date}
                        </div>
                      </div>

                      {/* Fake Sticker "Link na Bio/YouTube" */}
                      <div style={{ position: 'absolute', bottom: '25px', width: '100%', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <ArrowRight size={14} /> Arraste ou clique no link da bio
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMAIL MARKETING */}
                <h3 style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Cópia (Mala Direta) E-mail/WhatsApp</h3>
                <div className="glass-panel" style={{ padding: '1.5rem', position: 'relative' }}>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(emailTemplate); alert('Copiado para a área de transferência!'); }}
                    className="btn btn-secondary" style={{ position: 'absolute', top: '15px', right: '15px', width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)' }}>
                    <Copy size={16} /> Copiar Texto
                  </button>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0, color: 'var(--text-light)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {emailTemplate}
                  </pre>
                </div>
              </>
            )}

            {activeTab === 'video' && (
              <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Grade Curricular</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gerencie seus módulos e aulas da plataforma de alunos.</p>
                  </div>
                  <button className="btn" style={{ width: 'auto', background: '#10b981', padding: '0.6rem 1.2rem', gap: '8px' }}>
                    <PlusCircle size={18} /> Novo Módulo
                  </button>
                </div>

                {modules.map(module => (
                  <div key={module.id} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                    
                    {/* Module Header */}
                    <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{module.title}</h3>
                      <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PlusCircle size={14} /> Adicionar Aula
                      </button>
                    </div>

                    {/* Lesson Items */}
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Fake Item 1 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                          <Video size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>O Paciente Chocado</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>40 min • ID Panda: 23d9x0012</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: '12px', fontWeight: 'bold' }}>Publicada</span>
                      </div>
                      
                      {/* Fake Item 2 */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ width: 40, height: 40, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                          <Video size={18} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem' }}>Atualização em Diretrizes (2025)</h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pendente: Sem vídeo adicionado</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '12px', fontWeight: 'bold' }}>Rascunho</span>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
export default Admin;
