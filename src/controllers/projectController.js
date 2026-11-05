const pool = require('../config/db');

// Get all projects (Admins see all projects, Members see only assigned projects)
const getProjects = async (req, res) => {
  try {
    const { id: userId, role } = req.user; // req.user token verify middleware se aayega

    let result;
    if (role === 'Admin' || role === 'Administrator') {
      // Admin can view all projects with total issues count
      result = await pool.query(`
        SELECT p.*, COUNT(i.id) AS total_issues 
        FROM projects p 
        LEFT JOIN issues i ON p.id = i.project_id 
        GROUP BY p.id 
        ORDER BY p.id ASC
      `);
    } else {
      // Normal Member can view only projects assigned to them (or where they are members)
      result = await pool.query(`
        SELECT DISTINCT p.*, COUNT(i.id) AS total_issues 
        FROM projects p 
        LEFT JOIN issues i ON p.id = i.project_id 
        WHERE p.owner_id = $1 
        GROUP BY p.id 
        ORDER BY p.id ASC
      `, [userId]);
    }

    res.json({ projects: result.rows });
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

// Create a new project (Admin Only - creates project and assigns owner)
const createProject = async (req, res) => {
  try {
    const { title, status } = req.body;
    const userId = req.user.id; // Logged-in admin ka ID jo project create kar raha hai

    const result = await pool.query(
      'INSERT INTO projects (title, owner_id, status) VALUES ($1, $2, $3) RETURNING *',
      [title, userId, status || 'Active']
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error while creating project' });
  }
};

// Update an existing project (Edit & Status Toggle)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;
    
    const result = await pool.query(
      'UPDATE projects SET title = COALESCE($1, title), status = COALESCE($2, status) WHERE id = $3 RETURNING *',
      [title, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project: result.rows[0] });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ error: 'Server error while updating project' });
  }
};

// Delete a project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error while deleting project' });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};