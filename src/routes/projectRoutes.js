const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');
const verifyToken = require('../middlewares/authMiddleware');

// POST /api/v1/projects - Create a new project (Protected by verifyToken middleware)
router.post('/', verifyToken, createProject);

// GET /api/v1/projects - Get all projects for the logged-in user (Protected)
router.get('/', verifyToken, getProjects);

module.exports = router;