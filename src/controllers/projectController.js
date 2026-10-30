const pool = require('../config/db');

// 1. Create a new project
const createProject = async (req, res) => {
    try {
        const { title } = req.body;
        const owner_id = req.user.id; // Comes from authMiddleware (decoded JWT token)

        // Insert project into the database linked to the logged-in user
        const newProject = await pool.query(
            'INSERT INTO projects (title, owner_id) VALUES ($1, $2) RETURNING *',
            [title, owner_id]
        );

        res.status(201).json({
            message: 'Project created successfully',
            project: newProject.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while creating project' });
    }
};

// 2. Get all projects for the logged-in user
const getProjects = async (req, res) => {
    try {
        const owner_id = req.user.id;

        // Fetch projects created by this specific user
        const projects = await pool.query(
            'SELECT * FROM projects WHERE owner_id = $1',
            [owner_id]
        );

        res.json({
            count: projects.rows.length,
            projects: projects.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while fetching projects' });
    }
};

module.exports = { createProject, getProjects };