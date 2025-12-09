const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/attendance/:id', async (req, res) => {
  const { id } = req.params;
  const { from, to } = req.query;
  let sql =
    'SELECT date,status FROM attendance WHERE student_id = ?';
  const params = [id];
  if (from) {
    sql += ' AND date >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND date <= ?';
    params.push(to);
  }
  sql += ' ORDER BY date DESC';
  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/password/:id', async (req, res) => {
  const { id } = req.params;
  const { new_password } = req.body;
  try {
    await pool.query(
      'UPDATE students SET password = ? WHERE id = ?',
      [new_password, id]
    );
    res.json({ message: 'Password changed' });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
