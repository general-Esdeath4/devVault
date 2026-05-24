const mongoose = require('mongoose');

const snippetSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        command: { type: String, required: true },
        note: { type: String },
        category: {
            type: String,
            enum: ['Terminal', 'Docker', 'Database', 'Git', 'Server', 'MongoDB', 'SQL', 'Other'],
            default: 'Other',
        },
        isFavorite: {
            type: Boolean,
            default: false,
        },
        tags: [{
            type: String
        }],
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User', // User modeli ile ilişki
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project', // Project modeli ile ilişki
        },
    },
    { timestamps: true }
);

const Snippet = mongoose.model('Snippet', snippetSchema);
module.exports = Snippet;
