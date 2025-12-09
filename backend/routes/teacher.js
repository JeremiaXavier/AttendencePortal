const express = require('express');
const router = express.Router();
const pool = require('../db');

// Students (optionally filtered by class)

router.post('/students', async (req, res) => {
  const { admission_no, name, password, class_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO students (admission_no, name, password, class_id) VALUES (?,?,?,?)',
      [admission_no, name, password, class_id || null]
    );
    res.json({ message: 'Student created' });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/students', async (req, res) => {
  const { class_id } = req.query;
  try {
    let sql =
      'SELECT id, admission_no, name, class_id FROM students';
    const params = [];
    if (class_id) {
      sql += ' WHERE class_id = ?';
      params.push(class_id);
    }
    sql += ' ORDER BY admission_no';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/students/:id', async (req, res) => {
  const { id } = req.params;
  const { admission_no, name, password, class_id } = req.body;
  try {
    await pool.query(
      'UPDATE students SET admission_no = ?, name = ?, password = ?, class_id = ? WHERE id = ?',
      [admission_no, name, password, class_id || null, id]
    );
    res.json({ message: 'Updated' });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

// Classes

router.get('/students', async (req, res) => {
  const { class_id } = req.query;
  try {
    let sql =
      'SELECT id, admission_no, name, class_id FROM students';
    const params = [];
    if (class_id) {
      sql += ' WHERE class_id = ?';
      params.push(class_id);
    }
    sql += ' ORDER BY admission_no';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

// Create class

router.post('/classes', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'Name required' });
  try {
    await pool.query('INSERT INTO classes (name) VALUES (?)', [name]);
    res.json({ message: 'Class created' });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

// Periods

router.get('/periods', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, period_no, label FROM periods ORDER BY period_no'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

// Old daily attendance (date only, still available if needed)

router.post('/attendance', async (req, res) => {
  const { student_id, date, status } = req.body;
  try {
    await pool.query(
      'INSERT INTO attendance (student_id, date, status) VALUES (?,?,?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
      [student_id, date, status]
    );
    res.json({ message: 'Saved' });
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/attendance', async (req, res) => {
  const { student_id, from, to } = req.query;
  let sql =
    'SELECT a.id,a.student_id,s.admission_no,s.name,a.date,a.status FROM attendance a JOIN students s ON a.student_id = s.id WHERE 1=1';
  const params = [];
  if (student_id) {
    sql += ' AND a.student_id = ?';
    params.push(student_id);
  }
  if (from) {
    sql += ' AND a.date >= ?';
    params.push(from);
  }
  if (to) {
    sql += ' AND a.date <= ?';
    params.push(to);
  }
  sql += ' ORDER BY a.date DESC';
  try {
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

// New period-wise attendance per class/date

router.get('/attendance/periodwise', async (req, res) => {
  const { class_id, date } = req.query;
  if (!class_id || !date) {
    return res.status(400).json({ message: 'Missing params' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT student_id, period_no, status FROM attendance WHERE class_id = ? AND date = ?',
      [class_id, date]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

router.post('/attendance/periodwise', async (req, res) => {
  const { class_id, date, records } = req.body;
  if (!class_id || !date || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Invalid payload' });
  }
  try {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const rec of records) {
        const { student_id, period_no, status } = rec;
        if (status !== 'present' && status !== 'absent') continue;
        await conn.query(
          'INSERT INTO attendance (student_id, class_id, date, period_no, status) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
          [student_id, class_id, date, period_no, status]
        );
      }
      await conn.commit();
      conn.release();
      res.json({ message: 'Saved' });
    } catch (e) {
      await conn.rollback();
      conn.release();
      res.status(500).json({ message: 'Error' });
    }
  } catch (e) {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
