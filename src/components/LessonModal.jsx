import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, Paperclip, Eye, EyeOff, Image as ImageIcon, Plus, FileText, MessageSquare } from 'lucide-react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const LessonModal = ({ isOpen, onClose, onSave, onDelete, lesson, moduleId }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    duration: '',
    videoUrl: '',
    thumbnailUrl: '',
    published: false,
    attachments: [], // { name, url, comment, storagePath }
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  // New attachment form
  const [newAttachment, setNewAttachment] = useState({ file: null, name: '', comment: '' });
  const [attachmentUploading, setAttachmentUploading] = useState(false);

  useEffect(() => {
    if (lesson) {
      setForm({
        title: lesson.title || '',
        description: lesson.description || '',
        duration: lesson.duration || '',
        videoUrl: lesson.videoUrl || '',
        thumbnailUrl: lesson.thumbnailUrl || '',
        published: lesson.published || false,
        attachments: lesson.attachments || [],
      });
      setThumbnailPreview(lesson.thumbnailUrl || null);
    } else {
      setForm({
        title: '', description: '', duration: '', videoUrl: '',
        thumbnailUrl: '', published: false, attachments: [],
      });
      setThumbnailPreview(null);
    }
  }, [lesson, isOpen]);

  if (!isOpen) return null;

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.arw')) {
      alert("Arquivos .ARW não são suportados. Exporte como JPG ou PNG.");
      return;
    }

    setThumbnailPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadProgress(0);

    try {
      const storagePath = `thumbnails/${moduleId}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
        },
        (error) => {
          console.error('Erro no upload da thumbnail:', error);
          alert('Erro ao fazer upload da thumbnail.');
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setForm(prev => ({ ...prev, thumbnailUrl: url }));
          setUploading(false);
        }
      );
    } catch (error) {
      console.error('Erro:', error);
      setUploading(false);
    }
  };

  const handleAddAttachment = async () => {
    if (!newAttachment.file || !newAttachment.name.trim()) {
      alert("Selecione um arquivo e dê um nome para ele.");
      return;
    }

    setAttachmentUploading(true);

    try {
      const storagePath = `attachments/${moduleId}/${Date.now()}_${newAttachment.file.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, newAttachment.file);

      uploadTask.on('state_changed', null, (error) => {
        console.error('Erro no upload do anexo:', error);
        alert('Erro ao fazer upload do arquivo.');
        setAttachmentUploading(false);
      }, async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setForm(prev => ({
          ...prev,
          attachments: [...prev.attachments, {
            name: newAttachment.name.trim(),
            url,
            comment: newAttachment.comment.trim(),
            storagePath,
          }]
        }));
        setNewAttachment({ file: null, name: '', comment: '' });
        setAttachmentUploading(false);
      });
    } catch (error) {
      console.error('Erro:', error);
      setAttachmentUploading(false);
    }
  };

  const handleRemoveAttachment = (index) => {
    if (!confirm("Remover este anexo?")) return;
    setForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      alert("O título da aula é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar a aula.');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja EXCLUIR esta aula? Esta ação não pode ser desfeita.")) return;
    setSaving(true);
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir a aula.');
    }
    setSaving(false);
  };

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '2rem',
  };

  const modalStyle = {
    background: '#111827', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', width: '100%', maxWidth: '720px',
    maxHeight: '90vh', overflow: 'auto', padding: '2rem',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  };

  const inputStyle = {
    width: '100%', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
    color: '#fff', fontSize: '0.95rem', outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)',
    marginBottom: '0.4rem', display: 'block',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>
            {lesson ? 'Editar Aula' : 'Nova Aula'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* Thumbnail */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={labelStyle}><ImageIcon size={14} style={{ verticalAlign: '-2px', marginRight: '6px' }} />Thumbnail da Aula</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: 160, height: 90, borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={28} color="rgba(255,255,255,0.15)" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleThumbnailUpload} style={{ ...inputStyle, padding: '0.5rem' }} />
              {uploading && (
                <div style={{ marginTop: '0.5rem', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#10b981', borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title + Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={labelStyle}>Título da Aula *</label>
            <input type="text" style={inputStyle} placeholder="Ex: O Paciente Chocado" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Duração</label>
            <input type="text" style={inputStyle} placeholder="Ex: 40 min" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Descrição / Legenda</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Descrição detalhada da aula, conteúdo abordado..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        {/* Video URL */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Link do Vídeo (Panda Video ou YouTube)</label>
          <input type="url" style={inputStyle} placeholder="https://player.pandavideo.com.br/... ou https://youtube.com/..." value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
        </div>

        {/* Published Toggle */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <button
            type="button"
            onClick={() => setForm({ ...form, published: !form.published })}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: form.published ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: form.published ? '#10b981' : '#ef4444',
              fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.2s',
            }}
          >
            {form.published ? <Eye size={16} /> : <EyeOff size={16} />}
            {form.published ? 'Publicada (visível para alunos)' : 'Rascunho (oculta)'}
          </button>
        </div>

        {/* Attachments Section */}
        <div style={{ marginBottom: '1.5rem', padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <label style={{ ...labelStyle, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Paperclip size={16} /> Anexos da Aula ({form.attachments.length})
          </label>

          {/* Existing Attachments */}
          {form.attachments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
              {form.attachments.map((att, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.7rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <FileText size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '500', fontSize: '0.9rem', color: '#fff' }}>{att.name}</div>
                    {att.comment && (
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={11} /> {att.comment}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleRemoveAttachment(idx)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', width: 30, height: 30, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Attachment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <input type="file" onChange={(e) => setNewAttachment({ ...newAttachment, file: e.target.files?.[0] || null })} style={{ ...inputStyle, padding: '0.4rem', fontSize: '0.85rem' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <input type="text" style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.8rem' }} placeholder="Nome do arquivo (ex: Artigo ABC)" value={newAttachment.name} onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })} />
              <input type="text" style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.5rem 0.8rem' }} placeholder="Comentário (opcional)" value={newAttachment.comment} onChange={(e) => setNewAttachment({ ...newAttachment, comment: e.target.value })} />
            </div>
            <button
              onClick={handleAddAttachment}
              disabled={attachmentUploading || !newAttachment.file}
              style={{
                background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px',
                justifyContent: 'center', width: 'fit-content', opacity: attachmentUploading || !newAttachment.file ? 0.5 : 1,
              }}
            >
              <Plus size={14} />
              {attachmentUploading ? 'Enviando...' : 'Adicionar Anexo'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            {lesson && onDelete && (
              <button onClick={handleDelete} disabled={saving} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Trash2 size={16} /> Excluir Aula
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              Cancelar
            </button>
            <button onClick={handleSubmit} disabled={saving || uploading} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '0.6rem 2rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', opacity: saving || uploading ? 0.6 : 1 }}>
              {saving ? 'Salvando...' : 'Salvar Aula'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonModal;
