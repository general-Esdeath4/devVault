import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, ArrowLeft, Copy, Trash2, CheckCircle2, Calendar, FolderKanban, Star, Edit2, Code, Link as LinkIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_URL } from '../config';
import './ProjectDetail.css';

const CATEGORIES = ['Terminal', 'Docker', 'Database', 'Git', 'Server', 'MongoDB', 'SQL', 'Other'];

const CATEGORY_LABELS = {
    'Terminal': 'Terminal',
    'Docker': 'Docker',
    'Database': 'Database',
    'Git': 'Git',
    'Server': 'Server',
    'MongoDB': 'MongoDB',
    'SQL': 'SQL',
    'Other': 'Diğer'
};

const ProjectDetail = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    // Silme Onay Modali State'i
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        id: null
    });

    const [newSnippet, setNewSnippet] = useState({
        title: '',
        command: '',
        note: '',
        category: CATEGORIES[0],
        tags: ''
    });

    const fetchProjectAndSnippets = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const { data: projectsData } = await axios.get(`${API_URL}/api/projects`, config);
            const foundProject = projectsData.find(p => p._id === id);
            setProject(foundProject);

            const { data: snippetsData } = await axios.get(`${API_URL}/api/snippets/project/${id}`, config);
            setSnippets(snippetsData);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectAndSnippets();
    }, [id]);

    const closeAddModal = () => {
        setShowModal(false);
        setNewSnippet({ title: '', command: '', note: '', category: CATEGORIES[0], tags: '' });
    };

    const handleCreateSnippet = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const payload = { 
                ...newSnippet, 
                projectId: id,
                tags: typeof newSnippet.tags === 'string'
                    ? newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean)
                    : []
            };
            
            await axios.post(`${API_URL}/api/snippets`, payload, config);
            toast.success('Komut başarıyla eklendi');
            closeAddModal();
            fetchProjectAndSnippets();
        } catch (error) {
            toast.error('Komut eklenemedi');
        }
    };

    const copyToClipboard = (command, snippetId) => {
        navigator.clipboard.writeText(command);
        setCopiedId(snippetId);
        toast.info('Komut panoya kopyalandı!', { toastId: 'copy-toast' });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleFavorite = async (snippetId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.patch(`${API_URL}/api/snippets/${snippetId}/favorite`, {}, config);
            fetchProjectAndSnippets();
        } catch (error) {
            toast.error('Favori güncellenemedi');
        }
    };

    const handleDeleteClick = (id) => {
        setConfirmDelete({
            isOpen: true,
            id: id
        });
    };

    const handleConfirmDelete = async () => {
        const id = confirmDelete.id;
        if (!id) return;
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.delete(`${API_URL}/api/snippets/${id}`, config);
            toast.success('Komut silindi');
            fetchProjectAndSnippets();
        } catch (error) {
            toast.error('Komut silinemedi');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!project) return <div className="page-container"><p>Proje bulunamadı.</p></div>;

    // Kategorilere göre grupla
    const groupedSnippets = snippets.reduce((acc, snippet) => {
        const cat = snippet.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(snippet);
        return acc;
    }, {});

    const getLanguage = (command) => {
        if (!command) return 'bash';
        if (command.startsWith('docker') || command.startsWith('FROM') || command.startsWith('version:')) return 'yaml';
        if (command.includes('npm') || command.includes('node') || command.includes('npx')) return 'bash';
        if (command.includes('SELECT') || command.includes('INSERT') || command.startsWith('mongodb')) return 'sql';
        if (command.includes('git')) return 'bash';
        return 'bash'; // default
    };

    const creationDate = new Date(project.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <div className="page-container project-detail-page">
            <Link to="/projects" className="back-link"><ArrowLeft size={18} /> Projelere Dön</Link>
            
            <div className="project-detail-header">
                <div className="header-info">
                    <div className="title-area">
                        <FolderKanban size={28} className="project-icon" />
                        <h2>{project.title}</h2>
                        <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {project.status}
                        </span>
                    </div>
                    <p className="project-desc">{project.description}</p>
                    <div className="project-meta">
                        <div className="meta-item">
                            <Calendar size={16} /> <span>Oluşturulma: {creationDate}</span>
                        </div>
                        {project.techStack && project.techStack.length > 0 && (
                            <div className="meta-item tech-stack-list">
                                {project.techStack.map((tech, i) => <span key={i} className="tech-badge">{tech}</span>)}
                            </div>
                        )}
                    </div>
                    {(project.githubLink || project.liveLink) && (
                        <div className="project-external-links" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {project.githubLink && (
                                <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="btn-outline flex-center gap-sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                    <Code size={16} /> GitHub Repo
                                </a>
                            )}
                            {project.liveLink && (
                                <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="btn-primary flex-center gap-sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>
                                    <LinkIcon size={16} /> Canlı Proje
                                </a>
                            )}
                        </div>
                    )}
                </div>
                <button className="btn-primary flex-center gap-sm add-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Komut Ekle
                </button>
            </div>

            <div className="snippets-content">
                {Object.keys(groupedSnippets).length > 0 ? (
                    Object.keys(groupedSnippets).map(category => (
                        <div key={category} className="category-section">
                            <h3 className="category-title">{category} Komutları</h3>
                            <div className="snippets-grid">
                                {groupedSnippets[category].map(snippet => (
                                    <div className="snippet-card" key={snippet._id}>
                                        <div className="snippet-header">
                                            <div className="snippet-title-area">
                                                <button className={`star-btn ${snippet.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(snippet._id)} title="Favori">
                                                    <Star size={18} fill={snippet.isFavorite ? "currentColor" : "none"} />
                                                </button>
                                                <h4>{snippet.title}</h4>
                                            </div>
                                            <button className="icon-btn danger" onClick={() => handleDeleteClick(snippet._id)} title="Sil"><Trash2 size={18} /></button>
                                        </div>
                                        
                                        {snippet.tags && snippet.tags.length > 0 && (
                                            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem'}}>
                                                {snippet.tags.map((tag, i) => (
                                                    <span key={i} style={{color: 'var(--primary-color)', fontSize: '0.85rem', opacity: 0.8}}>#{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        {snippet.note && <p className="snippet-note">{snippet.note}</p>}
                                        <div className="komut-code-area" style={{marginBottom: '1rem', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden'}}>
                                            <SyntaxHighlighter 
                                                language={getLanguage(snippet.command)} 
                                                style={vscDarkPlus}
                                                customStyle={{ margin: 0, padding: '1rem', fontSize: '0.95rem' }}
                                            >
                                                {snippet.command}
                                            </SyntaxHighlighter>
                                        </div>
                                        <div className="fav-actions" style={{display: 'flex', gap: '0.5rem', marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem'}}>
                                            <button className="btn-snippet copy" style={{flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} onClick={() => copyToClipboard(snippet.command, snippet._id)}>
                                                {copiedId === snippet._id ? <CheckCircle2 size={16} /> : <Copy size={16} />} Kopyala
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <p>Bu projeye ait henüz hiç kayıtlı komut bulunmuyor.</p>
                        <button className="btn-outline mt-sm" onClick={() => setShowModal(true)}>İlk Komutunu Ekle</button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Yeni Komut (Snippet) Ekle</h3>
                            <button className="close-btn" onClick={closeAddModal}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateSnippet}>
                            <div className="form-group">
                                <label>Kısa Başlık</label>
                                <input type="text" className="form-input" required value={newSnippet.title} onChange={e => setNewSnippet({...newSnippet, title: e.target.value})} placeholder="Örn: Veritabanını Başlat" />
                            </div>
                            <div className="form-group">
                                <label>Komut Kodu (Command)</label>
                                <textarea className="form-input command-input" rows="3" required value={newSnippet.command} onChange={e => setNewSnippet({...newSnippet, command: e.target.value})} placeholder="Örn: npm install axios"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Kategori</label>
                                <select 
                                    className="form-input" 
                                    value={newSnippet.category} 
                                    onChange={e => setNewSnippet({...newSnippet, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Etiketler (Tags) - Virgülle ayırın</label>
                                <input type="text" className="form-input" placeholder="Örn: docker, backend, db" value={newSnippet.tags} onChange={e => setNewSnippet({...newSnippet, tags: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Açıklama / Not (Opsiyonel)</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3"
                                    placeholder="Örn: Sadece development ortamında çalıştırın." 
                                    value={newSnippet.note} 
                                    onChange={e => setNewSnippet({...newSnippet, note: e.target.value})} 
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={closeAddModal}>İptal</button>
                                <button type="submit" className="btn-primary" style={{width: 'auto'}}>Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Komutu Sil"
                message="Bu komutu silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                confirmText="Sil"
                cancelText="İptal"
            />
        </div>
    );
};
export default ProjectDetail;
