import React, { useState, useRef } from 'react';
import { FileText, Download, Send, Play, Paperclip, Library, Heart, MessageCircle } from 'lucide-react';

const Dashboard = () => {
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  const commentRefs = useRef({});

  const courseModules = [
    {
      id: 'm1',
      title: 'Módulo 1: Prática Clínica Avançada',
      lessons: [
        { id: 'm1-a1', title: 'Aula 1: Atualizações em Novos Tratamentos', duration: '45 min' },
        { id: 'm1-a2', title: 'Aula 2: Protocolos de Dor Torácica', duration: '32 min' },
        { id: 'm1-a3', title: 'Aula 3: Como ler os guidelines e aplicar na prática', duration: '50 min' }
      ]
    },
    {
      id: 'm2',
      title: 'Módulo 2: Casos do Dia-a-Dia',
      lessons: [
        { id: 'm2-a1', title: 'Discussão de Caso: Paciente Idoso e Polifarmácia', duration: '28 min' },
        { id: 'm2-a2', title: 'Discussão de Caso: O Paciente Chocado', duration: '40 min' },
        { id: 'm2-a3', title: 'Interação Medicamentosa: O que não fazer', duration: '35 min' }
      ]
    }
  ];

  const [activeVideo, setActiveVideo] = useState({
    id: courseModules[0].lessons[0].id,
    title: courseModules[0].lessons[0].title,
    module: courseModules[0].title
  });

  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'Dra. Ana Costa',
      text: 'Excelente aula! O caso clínico apresentado aos 15 minutos ilustra perfeitamente a abordagem prática em pronto-socorro.',
      time: 'Há 2 horas',
      attachment: null,
      likes: 14,
      isLiked: false,
      replies: []
    },
    {
      id: 2,
      author: 'Dr. Roberto Mendes',
      text: 'Estou enviando o guideline europeu mais recente sobre o tema que foi discutido. Vale a leitura. Aborda muito a terapêutica.',
      time: 'Há 5 horas',
      attachment: { name: 'ESC_Guidelines_2025.pdf', size: '2.4 MB' },
      likes: 32,
      isLiked: true,
      replies: [
        { id: 201, author: 'Dra. Sofia Melo', text: 'Muito obrigada por compartilhar! Vai ser muito útil para o debate do módulo 3.', time: 'Há 3 horas' }
      ]
    }
  ]);

  const [repository, setRepository] = useState([
    { id: 101, commentId: 2, name: 'ESC_Guidelines_2025.pdf', size: '2.4 MB', uploader: 'Dr. Roberto Mendes' },
    { id: 102, commentId: null, name: 'Trial_Review_Nature.pdf', size: '1.1 MB', uploader: 'Sistema Docente' }
  ]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedFile) return;

    const newCommentId = Date.now();
    const newCommentObj = {
      id: newCommentId,
      author: 'Você (Dr. Exemplo)',
      text: newComment,
      time: 'Agora mesmo',
      attachment: selectedFile ? { name: selectedFile.name, size: 'Arquivo Local' } : null,
      likes: 0,
      isLiked: false,
      replies: []
    };

    setComments([newCommentObj, ...comments]);

    if (selectedFile) {
      setRepository([
        { id: Date.now(), commentId: newCommentId, name: selectedFile.name, size: 'Novo Arquivo', uploader: 'Você' },
        ...repository
      ]);
    }

    setNewComment("");
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleToggleLike = (id) => {
    setComments(comments.map(c => {
      if (c.id === id) {
        return { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 };
      }
      return c;
    }));
  };

  const handlePostReply = (commentId) => {
    if (!replyText.trim()) return;

    setComments(comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...c.replies, { id: Date.now(), author: 'Você (Dr. Exemplo)', text: replyText, time: 'Agora mesmo' }]
        };
      }
      return c;
    }));
    setReplyText("");
    setReplyingTo(null);
  };

  const scrollToComment = (commentId) => {
    if (commentId && commentRefs.current[commentId]) {
      commentRefs.current[commentId].scrollIntoView({ behavior: 'smooth', block: 'center' });
      setReplyingTo(commentId);
      
      // Pequeno efeito visual de "piscar" para destacar
      const el = commentRefs.current[commentId];
      el.style.transition = 'box-shadow 0.3s';
      el.style.boxShadow = '0 0 0 2px var(--accent-color)';
      setTimeout(() => {
        el.style.boxShadow = 'none';
      }, 1500);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      <nav className="navbar fade-in">
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>MedClass Hub</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Você: Dr. Exemplo</span>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(to bottom right, var(--accent-color), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>E</div>
        </div>
      </nav>

      <div className="dashboard-layout fade-in-delayed">
        {/* Left Sidebar / Modules */}
        <div className="sidebar fade-in-delayed" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="modules-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Play size={20} color="var(--accent-color)" />
              Conteúdo do Curso
            </h3>
            
            {courseModules.map(module => (
              <div key={module.id} className="module-group">
                <div className="module-title">{module.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  {module.lessons.map(lesson => (
                    <div 
                      key={lesson.id} 
                      className={`lesson-item ${activeVideo.id === lesson.id ? 'active' : ''}`}
                      onClick={() => setActiveVideo({ id: lesson.id, title: lesson.title, module: module.title })}
                    >
                      <Play size={14} fill={activeVideo.id === lesson.id ? "currentColor" : "none"} style={{ opacity: activeVideo.id === lesson.id ? 1 : 0.5, flexShrink: 0 }} />
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lesson.title}
                      </div>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5, flexShrink: 0 }}>{lesson.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <span style={{ color: 'var(--accent-color)', fontSize: '0.95rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activeVideo.module}</span>
            <h2 style={{ fontSize: '2.1rem', margin: 0, lineHeight: '1.2' }}>{activeVideo.title}</h2>
          </div>
          
          <div className="video-container" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', color: 'var(--text-muted)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Play size={40} color="var(--accent-color)" />
              </div>
              <p style={{ fontSize: '1.1rem' }}>Player de Vídeo Integrado (Hospedagem Personalizada)</p>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '1rem', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', width: '100%', borderRadius: '2px' }}>
                <div style={{ height: '100%', background: 'var(--accent-color)', width: '30%', borderRadius: '2px' }}></div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div className="comments-section">
              <h3 style={{ fontSize: '1.4rem' }}>Área de Discussões e Artigos Científicos ({comments.length})</h3>
              
              <form onSubmit={handlePostComment} style={{ marginBottom: '2.5rem', marginTop: '1.5rem' }}>
                <textarea 
                  className="form-input" 
                  rows="3" 
                  placeholder="Contribua com o diagnóstico, observações do caso ou anexe um novo artigo científico..."
                  style={{ width: '100%', resize: 'none', marginBottom: '0.8rem', padding: '1rem' }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--accent-color)', padding: '0.5rem 1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', transition: 'all 0.2s' }}>
                    <input type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                    <Paperclip size={18} />
                    <span>{selectedFile ? selectedFile.name : 'Vincular Arquivo ou PDF'}</span>
                  </label>
                  
                  <button type="submit" className="btn" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                    <Send size={18} /> Discutir
                  </button>
                </div>
              </form>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {comments.map(comment => (
                  <div key={comment.id} className="comment-card fade-in" ref={(el) => commentRefs.current[comment.id] = el}>
                    <div className="comment-header">
                      <span className="comment-author" style={{ fontSize: '1.05rem' }}>{comment.author}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{comment.time}</span>
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.98rem', margin: '0.5rem 0' }}>{comment.text}</p>
                    
                    {comment.attachment && (
                      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
                        <a href="#" className="comment-attachment" onClick={(e) => e.preventDefault()}>
                          <FileText size={16} />
                          {comment.attachment.name}
                          <Download size={14} style={{ marginLeft: '0.5rem' }} />
                        </a>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--glass-border)' }}>
                      <button 
                        onClick={() => handleToggleLike(comment.id)}
                        style={{ background: comment.isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', border: '1px solid', borderColor: comment.isLiked ? 'rgba(239, 68, 68, 0.3)' : 'var(--glass-border)', borderRadius: '6px', color: comment.isLiked ? '#ef4444' : 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.4rem 0.8rem', transition: 'all 0.2s', fontWeight: comment.isLiked ? '600' : '500' }}
                      >
                        <Heart size={16} fill={comment.isLiked ? '#ef4444' : 'none'} color={comment.isLiked ? '#ef4444' : 'var(--text-muted)'} />
                        {comment.isLiked ? 'Curtido' : 'Curtir'} ({comment.likes})
                      </button>
                      
                      <button 
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.4rem 0.8rem', transition: 'all 0.2s' }}
                      >
                        <MessageCircle size={16} color="var(--text-muted)" />
                        Responder {comment.attachment ? "ao PDF" : ""}
                      </button>
                    </div>

                    {replyingTo === comment.id && (
                      <div className="fade-in" style={{ marginTop: '1rem', display: 'flex', gap: '0.8rem', paddingLeft: '1rem', borderLeft: '2px solid var(--accent-color)' }}>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder={comment.attachment ? "Comente sobre o artigo..." : "Escreva sua resposta..."} 
                          style={{ flex: 1, padding: '0.6rem 1rem', fontSize: '0.9rem' }}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(comment.id) }}
                          autoFocus
                        />
                        <button className="btn" style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.9rem' }} onClick={() => handlePostReply(comment.id)}>
                          Enviar
                        </button>
                      </div>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
                        {comment.replies.map((reply, index) => (
                          <div key={reply.id} className="fade-in" style={{ background: 'rgba(255,255,255,0.02)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: '600', color: 'var(--text-light)' }}>{reply.author}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{reply.time}</span>
                            </div>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>{reply.text}</p>
                            
                            <button 
                              onClick={() => {
                                const newComments = [...comments];
                                const currentComment = newComments.find(c => c.id === comment.id);
                                const currentReply = currentComment.replies[index];
                                currentReply.isLiked = !currentReply.isLiked;
                                currentReply.likes = currentReply.isLiked ? (currentReply.likes || 0) + 1 : (currentReply.likes || 1) - 1;
                                setComments(newComments);
                              }}
                              style={{ background: 'none', border: 'none', color: reply.isLiked ? '#ef4444' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer', fontSize: '0.8rem', padding: 0, transition: 'all 0.2s' }}
                            >
                              <Heart size={13} fill={reply.isLiked ? '#ef4444' : 'none'} />
                              {reply.isLiked ? 'Curtido' : 'Curtir'} {reply.likes ? `(${reply.likes})` : ''}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Repository */}
        <div className="sidebar fade-in-delayed">
          <div className="repository-panel">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Library size={22} color="var(--accent-color)" />
              Repositório da Sessão
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Todos os artigos científicos enviados ativamente nesta discussão são acumulados aqui.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {repository.map((file) => (
                <div key={file.id} className="repo-item" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', gap: '0.75rem', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                  <FileText size={26} color="#60a5fa" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500', fontSize: '0.95rem', margin: 0, color: 'var(--text-light)' }}>
                      {file.name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Por: {file.uploader}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{file.size}</span>
                    </div>
                  </div>
                  {file.commentId && (
                    <button 
                      onClick={() => scrollToComment(file.commentId)}
                      title="Discutir este PDF na comunidade"
                      style={{ background: 'rgba(59,130,246,0.15)', border: 'none', color: '#60a5fa', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s', marginLeft: 'auto' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.3)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.15)'; e.currentTarget.style.transform = 'scale(1)' }}
                    >
                      <MessageCircle size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              {repository.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                  Nenhum arquivo enviado ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
