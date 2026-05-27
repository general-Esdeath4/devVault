import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Copy, CheckCircle2, Star, Edit2, Trash2, Loader2, Code2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';
import './SnippetManager.css';

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

const SnippetManager = () => {
    const [snippets, setSnippets] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [copiedId, setCopiedId] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [editSnippet, setEditSnippet] = useState(null);

    const [showAddModal, setShowAddModal] = useState(false);

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
        tags: '',
        projectId: ''
    });

    const fetchSnippets = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${API_URL}/api/snippets`, config);
            setSnippets(data);
        } catch (error) {
            console.error('Komutları yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${API_URL}/api/projects`, config);
            setProjects(data);
        } catch (error) {
            console.error('Projeleri yükleme hatası:', error);
        }
    };

    useEffect(() => {
        fetchSnippets();
        fetchProjects();
    }, []);

    const copyToClipboard = (command, id) => {
        navigator.clipboard.writeText(command);
        setCopiedId(id);
        toast.info('Komut kopyalandı!', { toastId: 'copy-toast' });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleFavorite = async (snippetId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.patch(`${API_URL}/api/snippets/${snippetId}/favorite`, {}, config);
            fetchSnippets();
        } catch (error) {
            toast.error('Favori güncellenemedi');
        }
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        setNewSnippet({
            title: '',
            command: '',
            note: '',
            category: CATEGORIES[0],
            tags: '',
            projectId: ''
        });
    };

    const closeEditModal = () => {
        setShowModal(false);
        setEditSnippet(null);
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
            fetchSnippets();
        } catch (error) {
            toast.error('Silinirken hata oluştu');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const payload = {
                title: newSnippet.title,
                command: newSnippet.command,
                note: newSnippet.note,
                category: newSnippet.category,
                projectId: newSnippet.projectId || undefined,
                tags: newSnippet.tags ? newSnippet.tags.split(',').map(t => t.trim()).filter(t => t !== '') : []
            };

            await axios.post(`${API_URL}/api/snippets`, payload, config);
            toast.success('Yeni komut eklendi');
            closeAddModal();
            fetchSnippets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Komut eklenemedi');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const payload = {
                title: editSnippet.title,
                command: editSnippet.command,
                note: editSnippet.note,
                category: editSnippet.category,
                projectId: editSnippet.projectId || null,
                tags: typeof editSnippet.tags === 'string' ? editSnippet.tags.split(',').map(t => t.trim()).filter(t => t !== '') : editSnippet.tags
            };

            await axios.put(`${API_URL}/api/snippets/${editSnippet._id}`, payload, config);
            toast.success('Komut güncellendi');
            closeEditModal();
            fetchSnippets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Güncellenemedi');
        }
    };

    const openEditModal = (snippet) => {
        setEditSnippet({
            ...snippet,
            tags: snippet.tags ? snippet.tags.join(', ') : ''
        });
        setShowModal(true);
    };

    const handleTagClick = (tag) => {
        setSearchQuery(tag); // Taga tıklayınca onu arama kutusuna at
    };

    // Tüm kategorileri bul
    const allCategories = Array.from(new Set(snippets.map(s => s.category || 'Other')));

    // Filtreleme
    const filteredSnippets = snippets.filter(snippet => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
            snippet.title.toLowerCase().includes(query) || 
            snippet.command.toLowerCase().includes(query) || 
            (snippet.note && snippet.note.toLowerCase().includes(query)) ||
            (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(query.replace('#', ''))));
        
        const matchesCat = categoryFilter === 'All' || snippet.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const getLanguage = (command) => {
        if (command.startsWith('docker') || command.startsWith('FROM') || command.startsWith('version:')) return 'yaml';
        if (command.includes('npm') || command.includes('node') || command.includes('npx')) return 'bash';
        if (command.includes('SELECT') || command.includes('INSERT') || command.startsWith('mongodb')) return 'sql';
        if (command.includes('git')) return 'bash';
        return 'bash'; // default
    };

    return (
        <div className="page-container snippets-page">
            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                    <h2 className="page-title flex-center gap-sm" style={{justifyContent: 'flex-start'}}><Code2 size={28} /> Komut Kasası</h2>
                    <p className="page-subtitle" style={{ margin: 0 }}>Tüm projelerinizdeki komutları, kod parçacıklarını ve notları buradan yönetin.</p>
                </div>
                <button className="btn-primary flex-center gap-sm" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={() => setShowAddModal(true)}>
                    <Plus size={20} /> Yeni Komut Ekle
                </button>
            </div>

            <div className="snippet-filters">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text" 
                        placeholder="Komut, başlık veya #tag ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                    <option value="All">Tüm Kategoriler</option>
                    {allCategories.map((cat, i) => (
                        <option key={i} value={cat}>{cat === 'Other' ? 'Diğer' : cat}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex-center mt-xl"><Loader2 className="spin" size={40} /></div>
            ) : (
                <div className="snippets-masonry">
                    {filteredSnippets.map((snippet) => (
                        <div className="komut-card" key={snippet._id}>
                            <div className="komut-header">
                                <div className="komut-title-area">
                                    <button className={`komut-star ${snippet.isFavorite ? 'active' : ''}`} onClick={() => toggleFavorite(snippet._id)} title="Favori">
                                        <Star size={20} fill={snippet.isFavorite ? "currentColor" : "none"} />
                                    </button>
                                    <h3>{snippet.title}</h3>
                                </div>
                                <span className="komut-cat">{snippet.category}</span>
                            </div>
                            
                            {snippet.note && <p className="komut-desc">{snippet.note}</p>}
                            
                            <div className="komut-code-area">
                                <SyntaxHighlighter 
                                    language={getLanguage(snippet.command)} 
                                    style={vscDarkPlus}
                                    customStyle={{ borderRadius: '8px' }}
                                >
                                    {snippet.command}
                                </SyntaxHighlighter>
                            </div>

                            {snippet.tags && snippet.tags.length > 0 && (
                                <div className="komut-tags">
                                    {snippet.tags.map((tag, i) => (
                                        <span key={i} className="komut-tag" onClick={() => handleTagClick(tag)}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="komut-actions">
                                <button className="btn-snippet copy" onClick={() => copyToClipboard(snippet.command, snippet._id)}>
                                    {copiedId === snippet._id ? <><CheckCircle2 size={16} /> Kopyalandı</> : <><Copy size={16} /> Kopyala</>}
                                </button>
                                <button className="btn-snippet edit" onClick={() => openEditModal(snippet)}>
                                    <Edit2 size={16} /> Düzenle
                                </button>
                                <button className="btn-snippet delete" onClick={() => handleDeleteClick(snippet._id)}>
                                    <Trash2 size={16} /> Sil
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredSnippets.length === 0 && (
                        <div className="empty-state" style={{gridColumn: '1 / -1'}}>
                            <p>Eşleşen komut bulunamadı.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {showModal && editSnippet && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Komutu Düzenle</h3>
                            <button className="close-btn" onClick={closeEditModal}>&times;</button>
                        </div>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Kısa Başlık</label>
                                <input type="text" className="form-input" required value={editSnippet.title} onChange={e => setEditSnippet({...editSnippet, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Komut Kodu (Command)</label>
                                <textarea className="form-input command-input" rows="4" required value={editSnippet.command} onChange={e => setEditSnippet({...editSnippet, command: e.target.value})}></textarea>
                            </div>
                            <div className="form-group">
                                <label>İlişkili Proje (Opsiyonel)</label>
                                <select className="form-input" value={editSnippet.projectId || ''} onChange={e => setEditSnippet({...editSnippet, projectId: e.target.value || ''})}>
                                    <option value="">Genel / Projesiz</option>
                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>{project.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Kategori</label>
                                <select 
                                    className="form-input" 
                                    value={editSnippet.category} 
                                    onChange={e => setEditSnippet({...editSnippet, category: e.target.value})}
                                >
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Etiketler (Tags) - Virgülle ayırın</label>
                                <input type="text" className="form-input" placeholder="Örn: docker, backend, mongo" value={editSnippet.tags} onChange={e => setEditSnippet({...editSnippet, tags: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Açıklama / Not</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3"
                                    placeholder="Komuta dair açıklama yazın..." 
                                    value={editSnippet.note} 
                                    onChange={e => setEditSnippet({...editSnippet, note: e.target.value})} 
                                ></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={closeEditModal}>İptal</button>
                                <button type="submit" className="btn-primary" style={{width: 'auto'}}>Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Yeni Komut Ekle</h3>
                            <button className="close-btn" onClick={closeAddModal}>&times;</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Kısa Başlık</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    required 
                                    placeholder="Komut başlığını girin..." 
                                    value={newSnippet.title} 
                                    onChange={e => setNewSnippet({...newSnippet, title: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Komut Kodu (Command)</label>
                                <textarea 
                                    className="form-input command-input" 
                                    rows="4" 
                                    required 
                                    placeholder="Komut veya kod satırını buraya yapıştırın..." 
                                    value={newSnippet.command} 
                                    onChange={e => setNewSnippet({...newSnippet, command: e.target.value})}
                                ></textarea>
                            </div>
                            <div className="form-group">
                                <label>İlişkili Proje (Opsiyonel)</label>
                                <select 
                                    className="form-input" 
                                    value={newSnippet.projectId} 
                                    onChange={e => setNewSnippet({...newSnippet, projectId: e.target.value})}
                                >
                                    <option value="">Genel / Projesiz</option>
                                    {projects.map((project) => (
                                        <option key={project._id} value={project._id}>{project.title}</option>
                                    ))}
                                </select>
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
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Örn: docker, backend, mongo" 
                                    value={newSnippet.tags} 
                                    onChange={e => setNewSnippet({...newSnippet, tags: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Açıklama / Not</label>
                                <textarea 
                                    className="form-input" 
                                    rows="3"
                                    placeholder="Komuta dair kısa bir not yazın..." 
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

export default SnippetManager;
