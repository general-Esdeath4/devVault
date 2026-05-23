import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Loader2, Search, LayoutDashboard, Code2, Star, Clock, Copy, CheckCircle2, ChevronRight, FolderKanban } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [snippets, setSnippets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        status: 'Hazır',
        techStack: '',
        githubLink: '',
        liveLink: ''
    });

    const fetchData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            
            const [projectsRes, snippetsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/projects', config),
                axios.get('http://localhost:5000/api/snippets', config)
            ]);
            
            setProjects(projectsRes.data);
            setSnippets(snippetsRes.data);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const payload = {
                ...newProject,
                techStack: typeof newProject.techStack === 'string' 
                    ? newProject.techStack.split(',').map(tech => tech.trim()).filter(Boolean)
                    : []
            };
            await axios.post('http://localhost:5000/api/projects', payload, config);
            toast.success('Proje oluşturuldu');
            setShowModal(false);
            setNewProject({ title: '', description: '', status: 'Hazır', techStack: '', githubLink: '', liveLink: '' });
            fetchData();
        } catch (error) {
            console.error('Proje ekleme hatası:', error);
            toast.error(error.response?.data?.message || 'Proje eklenemedi');
        }
    };

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
            await axios.patch(`http://localhost:5000/api/snippets/${snippetId}/favorite`, {}, config);
            fetchData();
        } catch (error) {
            toast.error('Favori güncellenemedi');
        }
    };

    // İstatistik Hesaplamaları
    const totalProjects = projects.length;
    const totalSnippets = snippets.length;
    const favoriteSnippets = snippets.filter(s => s.isFavorite);
    const favoriteCount = favoriteSnippets.length;
    
    // Son Güncelleme (Projeler ve Snippetlar arasında en son tarih)
    const allDates = [...projects, ...snippets].map(item => new Date(item.updatedAt));
    const lastUpdateDate = allDates.length > 0 ? new Date(Math.max(...allDates)).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Henüz Yok';

    // Son Kullanılan Projeler
    const recentProjects = [...projects].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);

    // Arama Mantığı
    const lowerQuery = searchQuery.toLowerCase();
    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(lowerQuery) || 
        (p.techStack && p.techStack.join(' ').toLowerCase().includes(lowerQuery))
    );
    const filteredSnippets = snippets.filter(s => 
        s.title.toLowerCase().includes(lowerQuery) || 
        s.command.toLowerCase().includes(lowerQuery) || 
        (s.category && s.category.toLowerCase().includes(lowerQuery))
    );

    const isSearching = searchQuery.trim().length > 0;

    return (
        <div className="page-container dashboard-page">
            <div className="dashboard-top-bar">
                <div className="dashboard-header-text">
                    <h2 className="page-title">Hoş Geldin, {user?.username} 👋</h2>
                    <p className="page-subtitle">Platform istatistiklerin ve favori araçların burada.</p>
                </div>
                <div className="global-search-container">
                    <Search className="search-icon" size={20} />
                    <input 
                        type="text" 
                        className="global-search-input" 
                        placeholder="Proje, snippet, kategori veya teknoloji ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn-primary flex-center gap-sm new-project-btn" onClick={() => setShowModal(true)}>
                    <Plus size={20} /> Yeni Proje
                </button>
            </div>

            {loading ? (
                <div className="flex-center mt-xl"><Loader2 className="spin" size={40} /></div>
            ) : isSearching ? (
                /* ARAMA SONUÇLARI */
                <div className="search-results-area">
                    <h3 className="section-title">Arama Sonuçları: "{searchQuery}"</h3>
                    
                    <div className="results-grid">
                        <div className="results-column">
                            <h4 className="flex-center gap-sm"><FolderKanban size={18}/> Projeler ({filteredProjects.length})</h4>
                            <div className="recent-projects-list">
                                {filteredProjects.length > 0 ? filteredProjects.map(project => (
                                    <div key={project._id} className="recent-project-card" onClick={() => navigate(`/projects/${project._id}`)}>
                                        <div className="recent-project-info">
                                            <h4>{project.title}</h4>
                                            <div className="tech-stack-mini">
                                                {project.techStack?.slice(0, 3).map((tech, i) => <span key={i} className="tech-badge">{tech}</span>)}
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="go-icon" />
                                    </div>
                                )) : <p className="empty-text">Eşleşen proje bulunamadı.</p>}
                            </div>
                        </div>

                        <div className="results-column">
                            <h4 className="flex-center gap-sm"><Code2 size={18}/> Komutlar ({filteredSnippets.length})</h4>
                            <div className="fav-snippets-list">
                                {filteredSnippets.length > 0 ? filteredSnippets.map(snippet => (
                                    <div key={snippet._id} className="fav-snippet-item">
                                        <div className="fav-snippet-header">
                                            <div>
                                                <h5>{snippet.title}</h5>
                                                <span className="category-badge mini">{snippet.category}</span>
                                            </div>
                                            <div className="fav-actions">
                                                <button className="icon-btn" onClick={() => copyToClipboard(snippet.command, snippet._id)}>
                                                    {copiedId === snippet._id ? <CheckCircle2 size={16} color="#2ecc71" /> : <Copy size={16} />}
                                                </button>
                                                <button className="icon-btn" onClick={() => navigate(`/projects/${snippet.projectId}`)}>
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <code className="mini-code">{snippet.command}</code>
                                    </div>
                                )) : <p className="empty-text">Eşleşen komut bulunamadı.</p>}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* NORMAL DASHBOARD */
                <>
                    {/* STATS GRID */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper blue"><FolderKanban size={24} /></div>
                            <div className="stat-details">
                                <h3>{totalProjects}</h3>
                                <p>Toplam Proje</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper purple"><Code2 size={24} /></div>
                            <div className="stat-details">
                                <h3>{totalSnippets}</h3>
                                <p>Toplam Snippet</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper yellow"><Star size={24} /></div>
                            <div className="stat-details">
                                <h3>{favoriteCount}</h3>
                                <p>Favori Komut</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper green"><Clock size={24} /></div>
                            <div className="stat-details">
                                <h3 style={{fontSize: '1.2rem', lineHeight: '28px'}}>{lastUpdateDate}</h3>
                                <p>Son Güncelleme</p>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-content-grid">
                        {/* RECENT PROJECTS */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h3 className="section-title">Son Kullanılan Projeler</h3>
                                <Link to="/projects" className="view-all-link">Tümünü Gör</Link>
                            </div>
                            <div className="recent-projects-list">
                                {recentProjects.length > 0 ? recentProjects.map(project => {
                                    const snippetCount = snippets.filter(s => s.projectId === project._id).length;
                                    return (
                                        <div key={project._id} className="recent-project-card" onClick={() => navigate(`/projects/${project._id}`)}>
                                            <div className="recent-project-info">
                                                <h4>{project.title}</h4>
                                                <div className="tech-stack-mini">
                                                    {project.techStack?.slice(0, 3).map((tech, i) => <span key={i} className="tech-badge">{tech}</span>)}
                                                </div>
                                            </div>
                                            <div className="recent-project-meta">
                                                <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                                    {project.status}
                                                </span>
                                                <span className="snippet-count-badge" title="Snippet Sayısı">
                                                    <Code2 size={14} /> {snippetCount}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="empty-state mini">Projeleriniz burada görünecek.</div>
                                )}
                            </div>
                        </div>

                        {/* FAVORITE COMMANDS */}
                        <div className="dashboard-section">
                            <div className="section-header">
                                <h3 className="section-title">Favori Komutlar</h3>
                            </div>
                            <div className="fav-snippets-list">
                                {favoriteSnippets.length > 0 ? favoriteSnippets.slice(0, 5).map(snippet => (
                                    <div key={snippet._id} className="fav-snippet-item">
                                        <div className="fav-snippet-header">
                                            <div className="fav-snippet-title-area">
                                                <button className="star-btn active" onClick={() => toggleFavorite(snippet._id)} title="Favorilerden Çıkar">
                                                    <Star size={16} fill="currentColor" />
                                                </button>
                                                <h5>{snippet.title}</h5>
                                                <span className="category-badge mini">{snippet.category}</span>
                                            </div>
                                            <div className="fav-actions">
                                                <button className="icon-btn" onClick={() => copyToClipboard(snippet.command, snippet._id)} title="Kopyala">
                                                    {copiedId === snippet._id ? <CheckCircle2 size={16} color="#2ecc71" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                        </div>
                                        <code className="mini-code">{snippet.command}</code>
                                    </div>
                                )) : (
                                    <div className="empty-state mini">
                                        <Star size={30} style={{opacity: 0.3, marginBottom: '0.5rem'}} />
                                        <p>Henüz favori komutunuz yok.</p>
                                        <small>Proje detaylarından favori ekleyebilirsiniz.</small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Yeni Proje Oluştur</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="form-group">
                                <label>Proje Başlığı</label>
                                <input type="text" className="form-input" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Açıklama</label>
                                <textarea className="form-input" rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
                            </div>
                            <div className="form-group">
                                <label>Teknolojiler (Virgülle ayırın)</label>
                                <input type="text" className="form-input" placeholder="Örn: React, Node.js, MongoDB" value={newProject.techStack} onChange={e => setNewProject({...newProject, techStack: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Durum</label>
                                <select className="form-input" value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})}>
                                    <option value="Hazır">Hazır</option>
                                    <option value="Geliştiriliyor">Geliştiriliyor</option>
                                    <option value="Test Ediliyor">Test Ediliyor</option>
                                    <option value="Sorunlu">Sorunlu</option>
                                    <option value="Tamamlandı">Tamamlandı</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>GitHub Linki (Opsiyonel)</label>
                                <input type="url" className="form-input" placeholder="https://github.com/..." value={newProject.githubLink} onChange={e => setNewProject({...newProject, githubLink: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Canlı Demo Linki (Opsiyonel)</label>
                                <input type="url" className="form-input" placeholder="https://..." value={newProject.liveLink} onChange={e => setNewProject({...newProject, liveLink: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>İptal</button>
                                <button type="submit" className="btn-primary" style={{width: 'auto'}}>Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
