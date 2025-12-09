const db = require("./db");

// 1️⃣ Create Database
db.query("CREATE DATABASE IF NOT EXISTS attendance_tracker", (err) => {
  if (err) throw err;
  console.log("Database created or already exists.");

  // Select Database
  db.changeUser({ database: "attendance_tracker" }, (err) => {
    if (err) throw err;

    // 2️⃣ Create Users Table
    const userTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) DEFAULT 'student'
      )
    `;
    db.query(userTable, (err) => {
      if (err) throw err;
      console.log("Users table created.");
    });

    // 3️⃣ Create Attendance Table
    const attendanceTable = `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(50),
        date DATE,
        status VARCHAR(10) CHECK (status IN ('Present', 'Absent')),
        FOREIGN KEY (userId) REFERENCES users(userId)
      )
    `;
    db.query(attendanceTable, (err) => {
      if (err) throw err;
      console.log("Attendance table created.");
      db.end();
    });
  });
});
