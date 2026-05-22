const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        githubLink: { type: String },
        liveLink: { type: String },
        techStack: [{ type: String }],
        status: {
            type: String,
            enum: ['Hazır', 'Geliştiriliyor', 'Test Ediliyor', 'Sorunlu', 'Tamamlandı'],
            default: 'Geliştiriliyor',
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // User modeli ile ilişki
        },
    },
    { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
