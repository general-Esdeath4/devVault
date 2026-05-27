import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Loader2, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { API_URL } from '../config';
import './Projects.css';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();

    // Filtreleme State'leri
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [techFilter, setTechFilter] = useState('All');

    // Silme Onay Modali State'i
    const [confirmDelete, setConfirmDelete] = useState({
        isOpen: false,
        id: null
    });

    const [newProject, setNewProject] = useState({
        _id: null,
        title: '',
        description: '',
        status: 'Hazır',
        techStack: '',
        githubLink: '',
        liveLink: ''
    });

    const fetchProjects = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${API_URL}/api/projects`, config);
            setProjects(data);
        } catch (error) {
            console.error('Proje yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openCreateModal = () => {
        setEditMode(false);
        setNewProject({ _id: null, title: '', description: '', status: 'Hazır', techStack: '', githubLink: '', liveLink: '' });
        setShowModal(true);
    };

    const openEditModal = (project) => {
        setEditMode(true);
        setNewProject({
            _id: project._id,
            title: project.title,
            description: project.description,
            status: project.status,
            techStack: project.techStack ? project.techStack.join(', ') : '',
            githubLink: project.githubLink || '',
            liveLink: project.liveLink || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const payload = {
                title: newProject.title,
                description: newProject.description,
                status: newProject.status,
                githubLink: newProject.githubLink,
                liveLink: newProject.liveLink,
                techStack: typeof newProject.techStack === 'string'
                    ? newProject.techStack.split(',').map(tech => tech.trim()).filter(Boolean)
                    : []
            };

            if (editMode) {
                await axios.put(`${API_URL}/api/projects/${newProject._id}`, payload, config);
                toast.success('Proje güncellendi');
            } else {
                await axios.post(`${API_URL}/api/projects`, payload, config);
                toast.success('Proje oluşturuldu');
            }
            
            setShowModal(false);
            fetchProjects();
        } catch (error) {
            console.error('İşlem hatası:', error);
            toast.error(error.response?.data?.message || 'İşlem başarısız');
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
            await axios.delete(`${API_URL}/api/projects/${id}`, config);
            toast.success('Proje silindi');
            fetchProjects();
        } catch (error) {
            toast.error('Silinirken hata oluştu');
        }
    };

    // Tüm teknolojileri topla (Filtre menüsü için)
    const allTechs = Array.from(new Set(projects.flatMap(p => p.techStack || [])));

    // Filtreleme Mantığı
    const filteredProjects = projects.filter(project => {
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
        const matchesTech = techFilter === 'All' || (project.techStack && project.techStack.includes(techFilter));
        return matchesSearch && matchesStatus && matchesTech;
    });

    return (
        <div className="page-container projects-page">
            <div className="page-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div>
                    <h2 className="page-title" style={{ margin: 0 }}>Tüm Projeler</h2>
                    <p className="page-subtitle" style={{ margin: 0, marginTop: '0.5rem' }}>Projelerinizi listeleyin, filtreleyin ve yönetin.</p>
                </div>
                <button className="btn-primary flex-center gap-sm" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={openCreateModal}>
                    <Plus size={20} /> Yeni Proje
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                        type="text" 
                        placeholder="Proje adı ile ara..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="All">Tüm Durumlar</option>
                    <option value="Hazır">Hazır</option>
                    <option value="Geliştiriliyor">Geliştiriliyor</option>
                    <option value="Test Ediliyor">Test Ediliyor</option>
                    <option value="Sorunlu">Sorunlu</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                </select>
                <select className="filter-select" value={techFilter} onChange={(e) => setTechFilter(e.target.value)}>
                    <option value="All">Tüm Teknolojiler</option>
                    {allTechs.map((tech, i) => (
                        <option key={i} value={tech}>{tech}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="flex-center mt-xl"><Loader2 className="spin" size={40} /></div>
            ) : (
                <div className="projects-grid">
                    {filteredProjects.map((project) => (
                        <div className="project-card" key={project._id}>
                            <div className="card-header">
                                <h3>{project.title}</h3>
                                <span className={`status-badge status-${project.status.replace(/\s+/g, '-').toLowerCase()}`}>
                                    {project.status}
                                </span>
                            </div>
                            <p className="card-desc">{project.description}</p>
                            
                            <div className="card-tech-stack">
                                {project.techStack?.map((tech, i) => (
                                    <span key={i} className="tech-badge">{tech}</span>
                                ))}
                            </div>

                            <div className="card-actions">
                                <button className="btn-card btn-view" onClick={() => navigate(`/projects/${project._id}`)}>
                                    <Eye size={16} /> İncele
                                </button>
                                <button className="btn-card btn-edit" onClick={() => openEditModal(project)}>
                                    <Edit2 size={16} /> Düzenle
                                </button>
                                <button className="btn-card btn-delete" onClick={() => handleDeleteClick(project._id)}>
                                    <Trash2 size={16} /> Sil
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredProjects.length === 0 && (
                        <div className="empty-state" style={{gridColumn: '1 / -1'}}>
                            <p>Eşleşen proje bulunamadı.</p>
                            {projects.length === 0 && (
                                <button className="btn-outline mt-sm" onClick={openCreateModal}>İlk Projeni Ekle</button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editMode ? 'Projeyi Düzenle' : 'Yeni Proje Oluştur'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
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

            <ConfirmModal 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null })}
                onConfirm={handleConfirmDelete}
                title="Projeyi Sil"
                message="Bu projeyi silmek istediğinize emin misiniz? Projeyle ilişkili tüm komutlar ve veriler de silinecektir. Bu işlem geri alınamaz."
                confirmText="Sil"
                cancelText="İptal"
            />
        </div>
    );
};
export default Projects;
