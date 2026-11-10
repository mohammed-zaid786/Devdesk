const pool = require('../config/db');

// Get all projects (Admins see all projects, Members see only assigned projects)
const getProjects = async (req, res) => {
  try {
    const { id: userId, role } = req.user; // req.user token verify middleware se aayega

    let result;
    if (role === 'Admin' || role === 'Administrator' || role === 'admin') {
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

// Create a new project (Admin Only - creates project with detailed fields and assigns owner)
const createProject = async (req, res) => {
  try {
    const { title, description, priority, deadline, status } = req.body;
    const userId = req.user.id; // Logged-in admin ka ID jo project create kar raha hai

    const result = await pool.query(
      `INSERT INTO projects (title, description, priority, deadline, status, owner_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        title, 
        description || null, 
        priority || 'Medium', 
        deadline || null, 
        status || 'Active', 
        userId
      ]
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ error: 'Server error while creating project' });
  }
};

// Update an existing project (Edit & Status Toggle with all fields)
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, deadline, status } = req.body;
    
    const result = await pool.query(
      `UPDATE projects 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           priority = COALESCE($3, priority), 
           deadline = COALESCE($4, deadline), 
           status = COALESCE($5, status) 
       WHERE id = $6 RETURNING *`,
      [title, description, priority, deadline, status, id]
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