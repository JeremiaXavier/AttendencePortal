const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/teacher-login', async (req, res) => {
  const { emp_id, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, emp_id FROM teachers WHERE emp_id = ? AND password = ?',
      [emp_id, password]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid' });
    res.json({ role: 'teacher', teacher: rows[0] });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/student-login', async (req, res) => {
  const { admission_no, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, admission_no, name FROM students WHERE admission_no = ? AND password = ?',
      [admission_no, password]
    );
    if (!rows.length) return res.status(401).json({ message: 'Invalid' });
    res.json({ role: 'student', student: rows[0] });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
