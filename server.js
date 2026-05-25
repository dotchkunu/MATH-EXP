const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve CSS files
app.use('/css', express.static(path.join(__dirname, 'public/css')));

// Serve JS files
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// API endpoint to get mathematical curve data (optional)
app.get('/api/curves', (req, res) => {
    const curves = {
        spiral: {
            name: "3D Spiral",
            equation: "x = r * cos(θ), y = t, z = r * sin(θ)",
            parameters: { turns: 4, radius: 5, height: 8 }
        },
        helix: {
            name: "Helix",
            equation: "x = R * cos(θ), y = h*t, z = R * sin(θ)",
            parameters: { radius: 4, height: 8, turns: 4 }
        },
        rose: {
            name: "Rose Curve",
            equation: "r = a * cos(kθ)",
            parameters: { k: 5, radius: 6 }
        },
        toroidal: {
            name: "Toroidal Spiral",
            equation: "x = (R + r*cos(2θ))*cos(θ), y = r*sin(2θ), z = (R + r*cos(2θ))*sin(θ)",
            parameters: { R: 5, r: 2, turns: 6 }
        }
    };
    res.json(curves);
});

// API endpoint to save drawn path (optional)
app.post('/api/save', (req, res) => {
    const data = req.body;
    const filename = `saved_${Date.now()}.json`;
    fs.writeFile(path.join(__dirname, 'saved', filename), JSON.stringify(data, null, 2), (err) => {
        if (err) {
            res.status(500).json({ error: 'Failed to save' });
        } else {
            res.json({ message: 'Saved successfully', filename });
        }
    });
});

// Create saved directory if not exists
if (!fs.existsSync('./saved')) {
    fs.mkdirSync('./saved');
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📁 Serving files from /public directory`);
    console.log(`🎨 Open your browser and enjoy 3D Turtle Graphics!`);
});