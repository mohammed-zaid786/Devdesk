const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const pool = require('./config/db');                  // Import database connection
const authRoutes = require('./routes/authRoutes');      // Import authentication routes
const projectRoutes = require('./routes/projectRoutes'); // Import project routes
const issueRoutes = require('./routes/issueRoutes');    // Import issue routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());                                      // Security headers
app.use(cors());                                        // Enable CORS for frontend communication
app.use(express.json());                                // Parse incoming JSON data

// Mount Auth Routes
app.use('/api/v1/auth', authRoutes);

// Mount Project Routes
app.use('/api/v1/projects', projectRoutes);

// Mount Issue Routes
app.use('/api/v1/issues', issueRoutes);

// Test Route
app.get('/', (req, res) => {
    res.json({ message: 'DevDesk Issue Tracker API is running live!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});