const express = require('express');
const router = express.Router();
const { 
    createIssue, 
    getAllIssues, 
    getProjectIssues, 
    updateIssue, 
    deleteIssue 
} = require('../controllers/issueController');
const verifyToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Issues
 *   description: Issue tracking and management endpoints
 */

/**
 * @swagger
 * /api/v1/issues:
 *   post:
 *     summary: Create a new issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - project_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               project_id:
 *                 type: integer
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Issue created successfully
 *       500:
 *         description: Server error
 */
router.post('/', verifyToken, createIssue);

/**
 * @swagger
 * /api/v1/issues:
 *   get:
 *     summary: Get all issues
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all issues retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getAllIssues);

/**
 * @swagger
 * /api/v1/issues/project/{projectId}:
 *   get:
 *     summary: Get all issues for a specific project
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project issues retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/project/:projectId', verifyToken, getProjectIssues);

/**
 * @swagger
 * /api/v1/issues/{id}:
 *   patch:
 *     summary: Update an issue status or details
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *     responses:
 *       200:
 *         description: Issue updated successfully
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Server error
 */
router.patch('/:id', verifyToken, updateIssue);

/**
 * @swagger
 * /api/v1/issues/{id}:
 *   delete:
 *     summary: Delete an issue
 *     tags: [Issues]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Issue deleted successfully
 *       404:
 *         description: Issue not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, deleteIssue);

module.exports = router;