const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Register Controller: Handles new user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Check if a user with this email already exists in the database
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash the user password securely using bcrypt before storing it
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user into the PostgreSQL 'users' table
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role || 'member']
        );

        // Send a success response with the created user data (excluding password)
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// 2. Login Controller: Authenticates registered users and issues a JWT token
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists in the database by email
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare the provided plain password with the hashed password in the database
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate a secure JSON Web Token (JWT) containing user ID and role
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '1d' }
        );

        // Send the generated token back to the client
        res.json({
            message: 'Logged in successfully',
            token
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during login' });
    }
};

module.exports = { registerUser, loginUser };