const express = require('express');
const router = express.Router();
const { createProject, getProjects, updateProject, deleteProject } = require('../controllers/projectController');
const verifyToken = require('../middlewares/authMiddleware');
// Assume karo aapne verifyAdmin middleware banaya hai middlewares folder ke andar
const verifyAdmin = require('../middlewares/adminMiddleware'); 

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management endpoints
 */

/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create a new project (Admin Only)
 *     tags: [Projects]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *       403:
 *         description: Access denied. Admins only.
 *       500:
 *         description: Server error
 */
// CHANGE: Yahan verifyAdmin add kiya hai taaki sirf Admin hi project create kar sake
router.post('/', verifyToken, verifyAdmin, createProject);

/**
 * @swagger
 * /api/v1/projects:
 *   get:
 *     summary: Get all projects (Admins get all, Members get assigned projects)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, getProjects);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   put:
 *     summary: Update or status toggle a project
 *     tags: [Projects]
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
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       403:
 *         description: Not authorized to update this project
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, updateProject);

/**
 * @swagger
 * /api/v1/projects/{id}:
 *   delete:
 *     summary: Delete a project (Admin Only typically)
 *     tags: [Projects]
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
 *         description: Project deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Project not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, verifyAdmin, deleteProject);

module.exports = router;