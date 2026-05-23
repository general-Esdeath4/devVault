const Snippet = require('../models/Snippet');
const Project = require('../models/Project');

// @desc    Kullanıcıya ait tüm snippetları getir
// @route   GET /api/snippets
// @access  Private
const getAllSnippets = async (req, res) => {
    try {
        const legacySnippets = await Snippet.find({ owner: { $exists: false } });
        if (legacySnippets.length > 0) {
            for (let snippet of legacySnippets) {
                if (snippet.projectId) {
                    const project = await Project.findById(snippet.projectId);
                    if (project) {
                        snippet.owner = project.owner;
                        await snippet.save();
                    }
                }
            }
        }
    } catch (err) {
        console.error('Legacy snippet migration error:', err);
    }

    const snippets = await Snippet.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(snippets);
};

// @desc    Belirli bir projeye ait snippetları getir
// @route   GET /api/snippets/project/:projectId
// @access  Private
const getSnippets = async (req, res) => {
    // Projenin varlığını ve kullanıcıya ait olduğunu doğrula
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
        res.status(404);
        throw new Error('Proje bulunamadı');
    }

    if (project.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Bu projenin snippetlarına erişim yetkiniz yok');
    }

    const snippets = await Snippet.find({ projectId: req.params.projectId }).sort({ createdAt: -1 });
    res.status(200).json(snippets);
};

const createSnippet = async (req, res) => {
    const { title, command, note, category, projectId, tags } = req.body;

    if (!title || !command) {
        res.status(400);
        throw new Error('Başlık ve komut alanları zorunludur');
    }

    if (projectId) {
        const project = await Project.findById(projectId);
        if (!project) {
            res.status(404);
            throw new Error('Proje bulunamadı');
        }

        if (project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu projeye snippet ekleme yetkiniz yok');
        }
    }

    const snippet = await Snippet.create({
        title,
        command,
        note,
        category,
        tags,
        owner: req.user._id,
        projectId: projectId || undefined
    });

    res.status(201).json(snippet);
};

// @desc    Snippet güncelle
// @route   PUT /api/snippets/:id
// @access  Private
const updateSnippet = async (req, res) => {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
        res.status(404);
        throw new Error('Snippet bulunamadı');
    }

    if (snippet.owner) {
        if (snippet.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu snippetı güncelleme yetkiniz yok');
        }
    } else if (snippet.projectId) {
        const project = await Project.findById(snippet.projectId);
        if (project && project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu snippetı güncelleme yetkiniz yok');
        }
    }

    const updatedSnippet = await Snippet.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });

    res.status(200).json(updatedSnippet);
};

// @desc    Snippet sil
// @route   DELETE /api/snippets/:id
// @access  Private
const deleteSnippet = async (req, res) => {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
        res.status(404);
        throw new Error('Snippet bulunamadı');
    }

    if (snippet.owner) {
        if (snippet.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu snippetı silme yetkiniz yok');
        }
    } else if (snippet.projectId) {
        const project = await Project.findById(snippet.projectId);
        if (project && project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu snippetı silme yetkiniz yok');
        }
    }

    await snippet.deleteOne();

    res.status(200).json({ id: req.params.id });
};

// @desc    Snippet favori durumunu değiştir
// @route   PATCH /api/snippets/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
        res.status(404);
        throw new Error('Snippet bulunamadı');
    }

    if (snippet.owner) {
        if (snippet.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu snippetı güncelleme yetkiniz yok');
        }
    } else if (snippet.projectId) {
        const project = await Project.findById(snippet.projectId);
        if (project && project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Bu snippetı güncelleme yetkiniz yok');
        }
    }

    snippet.isFavorite = !snippet.isFavorite;
    const updatedSnippet = await snippet.save();

    res.status(200).json(updatedSnippet);
};

module.exports = {
    getAllSnippets,
    getSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    toggleFavorite
};
