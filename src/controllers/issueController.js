const pool = require('../config/db');

// 1. Create a new issue for a project
const createIssue = async (req, res) => {
    try {
        const { title, project_id, assigned_to } = req.body;
        
        // Insert new issue into the database
        const newIssue = await pool.query(
            'INSERT INTO issues (title, project_id, assigned_to, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, project_id, assigned_to || null, 'open']
        );

        res.status(201).json({
            message: 'Issue created successfully',
            issue: newIssue.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while creating issue' });
    }
};

// 2. Get all issues for a specific project
const getProjectIssues = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const issues = await pool.query(
            'SELECT * FROM issues WHERE project_id = $1',
            [projectId]
        );

        res.json({
            count: issues.rows.length,
            issues: issues.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error while fetching issues' });
    }
};

// 3. Update an issue status or details
const updateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, status, assigned_to } = req.body;

        const updatedIssue = await pool.query(
            'UPDATE issues SET title = COALESCE($1, title), status = COALESCE($2, status), assigned_to = COALESCE($3, assigned_to) WHERE id = $4 RETURNING *',
            [title, status, assigned_to, id]
        );

        if (updatedIssue.rows.length === 0) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        res.json({
            message: 'Issue updated successfully',
            issue: updatedIssue.rows[0]
        });
    } catch (err) {
        console.error(err.message);
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
        console.error(err.message);
        res.status(500).json({ error: 'Server error while deleting issue' });
    }
};

module.exports = { 
    createIssue, 
    getProjectIssues, 
    updateIssue, 
    deleteIssue 
};