const verifyAdmin = (req, res, next) => {
  // req.user token verify middleware se aayega jo role check karega
  if (req.user && (req.user.role === 'admin' || req.user.role === 'Admin' || req.user.role === 'Administrator')) {
    next(); // Agar admin hai toh aage badho
  } else {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
};

module.exports = verifyAdmin;