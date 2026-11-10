const pool = require('../config/db');

// 0. Get all issues with project title and assignee name from the database
const getAllIssues = async (req, res) => {
    try {
        const issues = await pool.query(`
            SELECT i.*, p.title AS project_title, u.name AS assigned_to_name 
            FROM issues i 
            LEFT JOIN projects p ON i.project_id = p.id 
            LEFT JOIN users u ON i.assigned_to::text = u.id::text 
            ORDER BY i.id DESC
        `);
        res.json(issues.rows);
    } catch (err) {
        console.error('Error fetching issues:', err.message);
        res.status(500).json({ error: 'Server error while fetching issues' });
    }
};

// 1. Create a new issue for a project
const createIssue = async (req, res) => {
    try {
        const { title, description, project_id, assigned_to, priority, due_date } = req.body;
        
        if (!title || !project_id) {
            return res.status(400).json({ error: 'Title and project_id are required' });
        }

        // Insert new issue into the database
        const newIssue = await pool.query(
            'INSERT INTO issues (title, description, project_id, assigned_to, status, priority, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, description || null, project_id, assigned_to || null, 'Open', priority || 'Medium', due_date || null]
        );

        res.status(201).json({
            message: 'Issue created successfully',
            issue: newIssue.rows[0]
        });
    } catch (err) {
        console.error('Error creating issue:', err.message);
        res.status(500).json({ error: 'Server error while creating issue' });
    }
};

// 2. Get all issues for a specific project
const getProjectIssues = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const issues = await pool.query(
            `SELECT i.*, p.title AS project_title, u.name AS assigned_to_name 
             FROM issues i 
             LEFT JOIN projects p ON i.project_id = p.id 
             LEFT JOIN users u ON i.assigned_to::text = u.id::text 
             WHERE i.project_id = $1 
             ORDER BY i.id DESC`,
            [projectId]
        );

        res.json({
            count: issues.rows.length,
            issues: issues.rows
        });
    } catch (err) {
        console.error('Error fetching project issues:', err.message);
        res.status(500).json({ error: 'Server error while fetching project issues' });
    }
};

// 3. Update an issue status or details
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status, assigned_to, priority, due_date } = req.body;

        const updatedIssue = await pool.query(
            `UPDATE issues 
             SET title = COALESCE($1, title), 
                 description = COALESCE($2, description),
                 status = COALESCE($3, status), 
                 assigned_to = COALESCE($4, assigned_to),
                 priority = COALESCE($5, priority),
                 due_date = COALESCE($6, due_date)
             WHERE id = $7 RETURNING *`,
            [title, description, status, assigned_to, priority, due_date, id]
        );

        if (updatedIssue.rows.length === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.json({
            message: 'Issue updated successfully',
            issue: updatedIssue.rows[0]
        });
    } catch (err) {
        console.error('Error updating issue:', err.message);
        res.status(500).json({ error: 'Server error while updating issue' });
    }
};

// 4. Delete an issue
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedIssue = await pool.query(
            'DELETE FROM issues WHERE id = $1 RETURNING *',
            [id]
        );

        if (deletedIssue.rows.length === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.json({
            message: 'Issue deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting issue:', err.message);
        res.status(500).json({ error: 'Server error while deleting issue' });
    }
};

module.exports = { 
    getAllIssues,
    createIssue, 
    getProjectIssues, 
    updateIssue, 
    deleteIssue 
};