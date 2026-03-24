import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, Send, Play, Paperclip, Library, Heart, MessageCircle } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

const Dashboard = () => {
  const [newComment, setNewComment] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  
  const commentRefs = useRef({});

  const [courseModules, setCourseModules] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [repository, setRepository] = useState([]);
  const { user } = useAuth();
  const userName = user?.displayName || 'Usuário';
  const userInitial = userName.charAt(0).toUpperCase();

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
        console.error("Erro ao buscar agendamento ao vivo:", error);
      }
    };
    fetchLiveEvent();
  }, []);

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/live/')) return url.replace('youtube.com/live/', 'youtube.com/embed/').split('?')[0];
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URL(url).searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) { return url; }
    return url;
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim() && !selectedFile) return;

    const newCommentId = Date.now();
    const newCommentObj = {
      id: newCommentId,
      author: userName,
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
          replies: [...c.replies, { id: Date.now(), author: userName, text: replyText, time: 'Agora mesmo' }]
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
        <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold', letterSpacing: '-0.5px' }}>MFMed</h1>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>{userName}</span>
          {user?.photoURL ? (
            <img src={user.photoURL} alt={userName} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(to bottom right, var(--accent-color), #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{userInitial}</div>
          )}
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
                      className={`lesson-item ${activeVideo?.id === lesson.id ? 'active' : ''}`}
                      onClick={() => setActiveVideo({ id: lesson.id, title: lesson.title, module: module.title })}
                    >
                      <Play size={14} fill={activeVideo?.id === lesson.id ? "currentColor" : "none"} style={{ opacity: activeVideo?.id === lesson.id ? 1 : 0.5, flexShrink: 0 }} />
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
          
          {/* SESSÃO AO VIVO DO YOUTUBE PINADA NO TOPO */}
          {liveEvent && liveEvent.youtubeLink && !activeVideo && (
            <div className="fade-in" style={{ background: '#0b0f19', border: '1px solid #ef4444', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.15)' }}>
              <div style={{ padding: '1rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }}></div>
                  <span style={{ color: '#ef4444', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>TRANSMISSÃO AGENDADA: {liveEvent.date}</span>
                </div>
              </div>
              
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.8rem', marginTop: 0, marginBottom: '0.5rem', color: '#fff' }}>
                  {liveEvent.title} <span style={{ color: '#60a5fa', fontWeight: '400' }}>{liveEvent.subtitle}</span>
                </h2>
                
                <div style={{ position: 'relative', overflow: 'hidden', paddingBottom: '56.25%', height: 0, borderRadius: '12px', background: '#000', marginTop: '1.5rem', border: '1px solid var(--glass-border)' }}>
                  <iframe 
                    src={getYoutubeEmbedUrl(liveEvent.youtubeLink)} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          )}

          {/* VÍDEO SELECIONADO (PANDA PLATAFORMA) */}
          {activeVideo && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ color: 'var(--accent-color)', fontSize: '0.95rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{activeVideo?.module || "Nenhum módulo selecionado"}</span>
                <h2 style={{ fontSize: '2.1rem', margin: 0, lineHeight: '1.2' }}>{activeVideo?.title || "Nenhuma aula selecionada"}</h2>
              </div>
              
              <div className="video-container" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '56.25%', height: 0, borderRadius: '12px', background: '#000' }}>
                {activeVideo?.pandaId ? (
                  <iframe 
                    src={`https://player.pandavideo.com.br/embed/?v=${activeVideo.pandaId}`} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} 
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={40} color="var(--accent-color)" />
                    </div>
                    <p style={{ fontSize: '1.1rem' }}>Esse vídeo ainda está sendo carregado</p>
                  </div>
                )}
                
                {/* Download/Offline Action Bar */}
                {activeVideo?.pandaId && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                    <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }}>
                      ⬇ Baixar (PWA)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!activeVideo && !liveEvent && (
             <div className="video-container" style={{ position: 'relative', overflow: 'hidden', paddingBottom: '56.25%', height: 0, borderRadius: '12px', background: '#000' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(96, 165, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Play size={40} color="var(--accent-color)" />
                  </div>
                  <p style={{ fontSize: '1.1rem' }}>Selecione uma aula no módulo ao lado</p>
                </div>
             </div>
          )}

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
