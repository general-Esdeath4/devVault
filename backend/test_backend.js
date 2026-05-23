
const mongoose = require('mongoose');
require('dotenv').config();

async function test() {
    try {
        console.log("Testing POST project...");
        // Since we don't have the user token, we should just read from DB
        await mongoose.connect('mongodb://127.0.0.1:27017/devvault');
        console.log("Connected to DB");
        
        const User = require('./models/User');
        const user = await User.findOne({});
        if (!user) {
            console.log("No user found");
            process.exit(1);
        }

        const generateToken = require('./utils/generateToken');
        const token = generateToken(user._id);

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const payload = {
            title: 'Test Project directly',
            description: 'Test Desc',
            techStack: [''],
            status: 'Hazır',
            owner: user._id
        };

        const res = await fetch('http://127.0.0.1:5000/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...config.headers
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'API Error');
        }
        console.log("SUCCESS:", data);
    } catch (err) {
        console.log("ERROR:");
        console.log(err.message);
    }
    process.exit(0);
}

test();
