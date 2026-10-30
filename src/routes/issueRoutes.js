const express = require('express');
const router = express.Router();
const { 
    createIssue, 
    getProjectIssues, 
    updateIssue, 
    deleteIssue 
} = require('../controllers/issueController');
const verifyToken = require('../middlewares/authMiddleware');

// 1. POST /api/v1/issues - Create a new issue (Protected)
router.post('/', verifyToken, createIssue);

// 2. GET /api/v1/issues/:projectId - Get all issues for a specific project (Protected)
router.get('/:projectId', verifyToken, getProjectIssues);

// 3. PATCH /api/v1/issues/:id - Update an issue status or details (Protected)
router.patch('/:id', verifyToken, updateIssue);

// 4. DELETE /api/v1/issues/:id - Delete an issue (Protected)
router.delete('/:id', verifyToken, deleteIssue);

module.exports = router;
