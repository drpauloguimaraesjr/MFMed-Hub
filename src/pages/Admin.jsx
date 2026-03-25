import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, PlusCircle, Settings, LogOut, Video, Megaphone, Image as ImageIcon, Copy, Download, Calendar, ArrowRight, Play, Trash2, Edit3, Users, Mail, Phone, MapPin, Search, ChevronDown, ChevronUp } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import founderImg from '../assets/mestre_paulo.jpg';
import { db, storage } from '../firebase';
import { doc, setDoc, collection, addDoc, getDocs, deleteDoc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { logout } from '../firebase';
import LessonModal from '../components/LessonModal';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marketing'); // 'video' | 'marketing' | 'inscritos'
  
  // -- ESTADOS DA ABA DE VÍDEO (Aulas Regulares) --
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // -- LESSON MODAL --
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingModuleId, setEditingModuleId] = useState(null);

  // -- ESTADOS DA ABA DE MARKETING --
  const [marketingData, setMarketingData] = useState({
    title: '',
    subtitle: '',
    date: '',
    youtubeLink: ''
  });
  
  const [bgImage, setBgImage] = useState(founderImg);
  const feedRef = useRef(null);
  const storyRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  // -- ESTADOS DA ABA INSCRITOS --
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLead, setExpandedLead] = useState(null);

  // ========== FIRESTORE: LOAD MODULES + LESSONS ==========
  const fetchModules = async () => {
    setLoadingModules(true);
    try {
      const modulesQuery = query(collection(db, "modules"), orderBy("order", "asc"));
      const modulesSnap = await getDocs(modulesQuery);
      
      const modulesData = [];
      for (const moduleDoc of modulesSnap.docs) {
        const lessonsQuery = query(collection(db, "modules", moduleDoc.id, "lessons"), orderBy("order", "asc"));
        const lessonsSnap = await getDocs(lessonsQuery);
        const lessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        modulesData.push({ id: moduleDoc.id, ...moduleDoc.data(), lessons });
      }
      setModules(modulesData);
    } catch (error) {
      console.error("Erro ao carregar módulos:", error);
    }
    setLoadingModules(false);
  };

  // ========== FIRESTORE: LOAD LEADS ==========
  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const leadsQuery = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const snap = await getDocs(leadsQuery);
      setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Erro ao carregar inscritos:", error);
    }
    setLoadingLeads(false);
  };

  useEffect(() => {
    fetchModules();
    fetchLeads();
  }, []);

  // ========== MODULE CRUD ==========
  const handleAddModule = async () => {
    const title = prompt("Nome do novo módulo:");
    if (!title || !title.trim()) return;
    try {
      await addDoc(collection(db, "modules"), {
        title: title.trim(),
        order: modules.length,
        createdAt: serverTimestamp(),
      });
      fetchModules();
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
      alert("Erro ao criar módulo.");
    }
  };

  const handleRenameModule = async (moduleId, currentTitle) => {
    const newTitle = prompt("Novo nome do módulo:", currentTitle);
    if (!newTitle || !newTitle.trim() || newTitle.trim() === currentTitle) return;
    try {
      await updateDoc(doc(db, "modules", moduleId), { title: newTitle.trim() });
      fetchModules();
    } catch (error) {
      console.error("Erro ao renomear:", error);
      alert("Erro ao renomear módulo.");
    }
  };

  const handleDeleteModule = async (moduleId, lessonsCount) => {
    const msg = lessonsCount > 0
      ? `Este módulo tem ${lessonsCount} aula(s). Excluir tudo? Esta ação não pode ser desfeita.`
      : "Excluir este módulo vazio?";
    if (!confirm(msg)) return;
    try {
      // Delete all lessons first
      const lessonsSnap = await getDocs(collection(db, "modules", moduleId, "lessons"));
      for (const lessonDoc of lessonsSnap.docs) {
        await deleteDoc(doc(db, "modules", moduleId, "lessons", lessonDoc.id));
      }
      await deleteDoc(doc(db, "modules", moduleId));
      fetchModules();
    } catch (error) {
      console.error("Erro ao excluir módulo:", error);
      alert("Erro ao excluir módulo.");
    }
  };

  // ========== LESSON CRUD ==========
  const openNewLesson = (moduleId) => {
    setEditingModuleId(moduleId);
    setEditingLesson(null);
    setLessonModalOpen(true);
  };

  const openEditLesson = (moduleId, lesson) => {
    setEditingModuleId(moduleId);
    setEditingLesson(lesson);
    setLessonModalOpen(true);
  };

  const handleSaveLesson = async (formData) => {
    if (!editingModuleId) return;
    try {
      if (editingLesson) {
        // Update existing
        await updateDoc(doc(db, "modules", editingModuleId, "lessons", editingLesson.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create new
        const mod = modules.find(m => m.id === editingModuleId);
        const currentLessonsCount = mod?.lessons?.length || 0;
        await addDoc(collection(db, "modules", editingModuleId, "lessons"), {
          ...formData,
          order: currentLessonsCount,
          createdAt: serverTimestamp(),
        });
      }
      fetchModules();
    } catch (error) {
      console.error("Erro ao salvar aula:", error);
      throw error;
    }
  };

  const handleDeleteLesson = async () => {
    if (!editingModuleId || !editingLesson) return;
    try {
      await deleteDoc(doc(db, "modules", editingModuleId, "lessons", editingLesson.id));
      fetchModules();
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      throw error;
    }
  };

  // ========== MARKETING ==========
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

  const handleMarketingImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.arw')) {
        alert("Atenção! Arquivos .ARW (RAW) não podem ser lidos diretamente por navegadores. Por favor, exporte sua foto do ensaio como .JPG ou .PNG e tente novamente.");
        return;
      }
      setBgImage(URL.createObjectURL(file));
    }
  };

  const downloadImage = async (ref, filename, scaleConfig) => {
    if (!ref.current) return;
    try {
      const dataUrl = await htmlToImage.toPng(ref.current, { 
        quality: 1, 
        pixelRatio: scaleConfig.ratio,
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

  const emailTemplate = `Assunto: ${marketingData.title} ${marketingData.subtitle} (Aula Magna)

Colega Médico(a),

${marketingData.date ? `Nesta ${marketingData.date}` : '[Data]'}, realizarei a nossa Aula Magna Oficial de Lançamento da plataforma MFMed Hub. 

Tema: ${marketingData.title || '[Título]'} ${marketingData.subtitle || '[Subtítulo]'}

Acesse pelo link abaixo no horário marcado:
🔗 LINK DA AULA: ${marketingData.youtubeLink || '[Link do YouTube]'}

Nos vemos lá.
Dr. Paulo Guimarães Jr.`;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // ========== INSCRITOS HELPERS ==========
  const filteredLeads = leads.filter(lead => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (lead.name || '').toLowerCase().includes(term) ||
      (lead.email || '').toLowerCase().includes(term) ||
      (lead.phone || '').toLowerCase().includes(term) ||
      (lead.city || '').toLowerCase().includes(term) ||
      (lead.state || '').toLowerCase().includes(term)
    );
  });

  const formatDate = (timestamp) => {
    if (!timestamp) return '—';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return '—'; }
  };

  // ============================================
  // RENDER
  // ============================================
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
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </nav>

      <div className="container fade-in-delayed" style={{ flex: 1, maxWidth: '1200px', paddingTop: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
          
          {/* ===== SIDEBAR ===== */}
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
              <li>
                <div 
                  onClick={() => setActiveTab('inscritos')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1rem', background: activeTab === 'inscritos' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: activeTab === 'inscritos' ? '#a855f7' : 'var(--text-light)', borderRadius: '8px', cursor: 'pointer', borderLeft: activeTab === 'inscritos' ? '3px solid #a855f7' : '3px solid transparent', transition: 'all 0.2s' }}>
                  <Users size={20} /> Inscritos
                  {leads.length > 0 && (
                    <span style={{ marginLeft: 'auto', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>{leads.length}</span>
                  )}
                </div>
              </li>
            </ul>
          </div>

          {/* ===== MAIN AREA ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* ==================== MARKETING TAB ==================== */}
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
                    
                    <div ref={feedRef} style={{ width: '350px', height: '350px', position: 'relative', background: '#0b0f19', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.6 }}></div>
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

            {/* ==================== VIDEO / GRADE CURRICULAR TAB ==================== */}
            {activeTab === 'video' && (
              <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Grade Curricular</h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Gerencie seus módulos e aulas da plataforma de alunos.</p>
                  </div>
                  <button onClick={handleAddModule} className="btn" style={{ width: 'auto', background: '#10b981', padding: '0.6rem 1.2rem', gap: '8px' }}>
                    <PlusCircle size={18} /> Novo Módulo
                  </button>
                </div>

                {loadingModules && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Carregando módulos...
                  </div>
                )}

                {!loadingModules && modules.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    <Video size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>Nenhum módulo criado ainda.</p>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>Clique em "Novo Módulo" para começar a montar sua grade.</p>
                  </div>
                )}

                {modules.map(module => (
                  <div key={module.id} style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden' }}>
                    
                    {/* Module Header */}
                    <div style={{ padding: '1rem 1.5rem', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{module.title}</h3>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button onClick={() => handleRenameModule(module.id, module.title)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', borderRadius: '6px', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', transition: 'all 0.2s' }} title="Renomear módulo">
                          <Edit3 size={13} /> Renomear
                        </button>
                        <button onClick={() => handleDeleteModule(module.id, module.lessons?.length || 0)} style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', transition: 'all 0.2s' }} title="Excluir módulo">
                          <Trash2 size={13} />
                        </button>
                        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)', margin: '0 4px' }} />
                        <button onClick={() => openNewLesson(module.id)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                          <PlusCircle size={14} /> Adicionar Aula
                        </button>
                      </div>
                    </div>

                    {/* Lesson Items */}
                    <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map(lesson => (
                          <div 
                            key={lesson.id} 
                            onClick={() => openEditLesson(module.id, lesson)}
                            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.15)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; e.currentTarget.style.borderColor = 'transparent'; }}
                          >
                            {/* Thumbnail */}
                            <div style={{ width: 64, height: 36, borderRadius: '6px', overflow: 'hidden', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {lesson.thumbnailUrl ? (
                                <img src={lesson.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <Video size={16} color="#10b981" />
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '0.95rem', color: '#fff' }}>{lesson.title}</h4>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {lesson.duration || 'Sem duração'}
                                {lesson.attachments?.length > 0 && ` • ${lesson.attachments.length} anexo(s)`}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: lesson.published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: lesson.published ? '#10b981' : '#ef4444', borderRadius: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                              {lesson.published ? 'Publicada' : 'Rascunho'}
                            </span>
                            <Edit3 size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem', fontSize: '0.9rem' }}>
                          Nenhuma aula adicionada a este módulo.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ==================== INSCRITOS TAB ==================== */}
            {activeTab === 'inscritos' && (
              <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #a855f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users color="#a855f7" /> Inscritos
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                      {leads.length} pessoa(s) cadastrada(s) no programa.
                    </p>
                  </div>
                  <button onClick={fetchLeads} className="btn" style={{ width: 'auto', background: '#a855f7', padding: '0.6rem 1.2rem', gap: '8px', fontSize: '0.9rem' }}>
                    Atualizar Lista
                  </button>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                  <input
                    type="text"
                    placeholder="Buscar por nome, e-mail, telefone, cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                  />
                </div>

                {loadingLeads && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Carregando inscritos...
                  </div>
                )}

                {!loadingLeads && filteredLeads.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    {searchTerm ? 'Nenhum resultado para sua busca.' : 'Nenhum inscrito ainda.'}
                  </div>
                )}

                {/* Leads List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', transition: 'all 0.2s' }}
                    >
                      {/* Lead Row */}
                      <div
                        onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', cursor: 'pointer' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(168, 85, 247, 0.03)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        {/* Avatar */}
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', color: '#fff', flexShrink: 0 }}>
                          {(lead.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '500', fontSize: '0.95rem', color: '#fff' }}>{lead.name || 'Sem nome'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{lead.email}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0, textAlign: 'right' }}>
                          {formatDate(lead.createdAt)}
                        </div>
                        {expandedLead === lead.id ? <ChevronUp size={16} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.3)" />}
                      </div>

                      {/* Expanded Details */}
                      {expandedLead === lead.id && (
                        <div style={{ padding: '0 1.2rem 1rem 1.2rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                              <Mail size={14} color="#a855f7" /> {lead.email || '—'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                              <Phone size={14} color="#a855f7" /> {lead.phone || '—'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                              <MapPin size={14} color="#a855f7" /> {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.state || lead.city || '—'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
                              🔑 Senha temp: <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{lead.tempPassword || '—'}</code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* LESSON MODAL */}
      <LessonModal
        isOpen={lessonModalOpen}
        onClose={() => { setLessonModalOpen(false); setEditingLesson(null); setEditingModuleId(null); }}
        onSave={handleSaveLesson}
        onDelete={editingLesson ? handleDeleteLesson : null}
        lesson={editingLesson}
        moduleId={editingModuleId}
      />
    </div>
  );
};
export default Admin;
