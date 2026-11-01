const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const verifyToken = require('../middlewares/authMiddleware');

// POST /api/v1/projects - Create a new project (Protected by verifyToken middleware)
router.post('/', verifyToken, createProject);

// GET /api/v1/projects - Get all projects for the logged-in user (Protected)
router.get('/', verifyToken, getProjects);

// PUT /api/v1/projects/:id - Update or status toggle a project (Protected)
router.put('/:id', verifyToken, updateProject);

// DELETE /api/v1/projects/:id - Delete a project (Protected)
router.delete('/:id', verifyToken, deleteProject);

module.exports = router;