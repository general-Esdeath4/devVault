const Project = require('../models/Project');
const logActivity = require('../utils/logger');

// @desc    Kullanıcıya ait tüm projeleri getir
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    const projects = await Project.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(projects);
};

// @desc    Yeni proje oluştur
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    const { title, description, techStack, status, githubLink, liveLink } = req.body;

    if (!title) {
        res.status(400);
        throw new Error('Proje başlığı zorunludur');
    }

    const project = await Project.create({
        title,
        description,
        techStack,
        status,
        githubLink,
        liveLink,
        owner: req.user._id
    });

    // Aktiviteyi logla
    await logActivity(req.user._id, 'CREATE_PROJECT', `"${project.title}" adlı projeyi oluşturdu`);

    res.status(201).json(project);
};

// @desc    Projeyi güncelle
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı');
    }

    // Projenin sahibi mi kontrol et
    if (project.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Bu projeyi güncelleme yetkiniz yok');
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    // Aktiviteyi logla
    await logActivity(req.user._id, 'UPDATE_PROJECT', `"${updatedProject.title}" adlı projeyi güncelledi`);

    res.status(200).json(updatedProject);
};

// @desc    Projeyi sil
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı');
    }

    if (project.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Bu projeyi silme yetkiniz yok');
    }

    const projectTitle = project.title;
    await project.deleteOne();

    // Aktiviteyi logla
    await logActivity(req.user._id, 'DELETE_PROJECT', `"${projectTitle}" adlı projeyi sildi`);

    res.status(200).json({ id: req.params.id });
};

module.exports = {
    getProjects,
    createProject,
    updateProject,
    deleteProject
};
