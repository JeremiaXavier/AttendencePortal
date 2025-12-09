
```markdown
# College Attendance Portal

A full-stack attendance tracking portal for colleges (KTU-style) built with:

- Backend: Node.js, Express, MySQL
- Frontend: React + Tailwind CSS
- Roles: Teacher and Student
- Features:
  - Teacher login with Employee ID
  - Student login with Admission Number
  - Class and student management
  - Period-wise (hour-wise) attendance per day
  - Unmarked / Present / Absent states
  - Student attendance view with percentage and date filter

---

## 1. Project structure

Suggested folder layout:

```
Attendance-Tracker/
  backend/
    server.js
    db.js
    routes/
      auth.js
      teacher.js
      student.js
  frontend/
    src/
      api.js
      App.js
      TeacherDashboard.js
      TeacherStudentManager.js
      TeacherAttendanceManager.js
      StudentDashboard.js
      index.js
    tailwind.config.js
    postcss.config.js
    index.html (or Vite/CRA equivalent)
```

---

## 2. Prerequisites

- Node.js 18+ and npm
- MySQL 8+ server
- Git (optional)
- A code editor (VS Code, etc.)

---

## 3. Database setup (MySQL)

1. Login to MySQL:

   ```
   mysql -u root -p
   ```

2. Create database and tables:

   ```
   CREATE DATABASE IF NOT EXISTS attendance_app;
   USE attendance_app;

   CREATE TABLE teachers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     emp_id VARCHAR(50) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL
   );

   CREATE TABLE classes (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL
   );

   CREATE TABLE students (
     id INT AUTO_INCREMENT PRIMARY KEY,
     admission_no VARCHAR(50) UNIQUE NOT NULL,
     name VARCHAR(100) NOT NULL,
     password VARCHAR(255) NOT NULL,
     class_id INT NULL,
     FOREIGN KEY (class_id) REFERENCES classes(id)
   );

   CREATE TABLE periods (
     id INT AUTO_INCREMENT PRIMARY KEY,
     period_no TINYINT NOT NULL,
     label VARCHAR(20) NOT NULL
   );

   CREATE TABLE attendance (
     id INT AUTO_INCREMENT PRIMARY KEY,
     student_id INT NOT NULL,
     class_id INT NOT NULL,
     date DATE NOT NULL,
     period_no TINYINT NOT NULL,
     status ENUM('present','absent') NOT NULL,
     FOREIGN KEY (student_id) REFERENCES students(id),
     FOREIGN KEY (class_id) REFERENCES classes(id),
     UNIQUE KEY uniq_att (student_id, date, period_no)
   );
   ```

3. Seed basic data:

   ```
   INSERT INTO teachers (emp_id, password) VALUES ('T001', '1234');

   INSERT INTO classes (name) VALUES ('S3 CSE A'), ('S5 ECE B');

   INSERT INTO periods (period_no, label) VALUES
   (1, 'Hour 1'),
   (2, 'Hour 2'),
   (3, 'Hour 3'),
   (4, 'Hour 4'),
   (5, 'Hour 5'),
   (6, 'Hour 6');
   ```

You can add students either directly in MySQL or via the Teacher Student Manager screen.

---

## 4. Backend setup (Node + Express)

1. Go to backend folder:

   ```
   cd Attendance-Tracker/backend
   ```

2. Initialize and install dependencies:

   ```
   npm init -y
   npm install express cors mysql2
   ```

3. Create `db.js`:

   ```
   const mysql = require('mysql2');

   const pool = mysql
     .createPool({
       host: 'localhost',
       user: 'root',
       password: '',
       database: 'attendance_app'
     })
     .promise();

   module.exports = pool;
   ```

4. Create `server.js`:

   ```
   const express = require('express');
   const cors = require('cors');
   const pool = require('./db');
   const authRoutes = require('./routes/auth');
   const teacherRoutes = require('./routes/teacher');
   const studentRoutes = require('./routes/student');

   const app = express();
   app.use(cors());
   app.use(express.json());

   app.use('/api/auth', authRoutes);
   app.use('/api/teacher', teacherRoutes);
   app.use('/api/student', studentRoutes);

   app.listen(4000, () => {
     console.log('Backend running on http://localhost:4000');
   });
   ```

5. Implement routes:

- `routes/auth.js` – teacher and student login
- `routes/teacher.js` – classes, students, period-wise attendance
- `routes/student.js` – student attendance view and password change

6. Start backend:

   ```
   node server.js
   ```

Backend runs at `http://localhost:4000`.

---

## 5. Frontend setup (React + Tailwind)

Using Vite + React as example:

1. Create frontend app:

   ```
   cd Attendance-Tracker
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install
   ```

2. Install Tailwind and dependencies:

   ```
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. Configure Tailwind:

   `tailwind.config.js`:

   ```
   export default {
     content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
     theme: {
       extend: {}
     },
     plugins: []
   };
   ```

   `src/index.css`:

   ```
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Create `src/api.js`:

   ```
   import axios from 'axios';

   const api = axios.create({
     baseURL: 'http://localhost:4000/api'
   });

   export default api;
   ```

5. Replace `src/App.js` with your final login + routing logic:

- Local auth state with `localStorage`
- KTU-style login screen
- Show `TeacherDashboard` / `StudentDashboard` after login

6. Add dashboards/components:

- `TeacherDashboard.js` – shell with sidebar and tabs:
  - `TeacherStudentManager` (add classes + students)
  - `TeacherAttendanceManager` (period-wise attendance grid)
- `TeacherStudentManager.js` – class and student forms and list
- `TeacherAttendanceManager.js` – class selection + date + period grid
- `StudentDashboard.js` – student view with top bar, attendance table, and percentage

7. Start frontend:

   ```
   npm run dev
   ```

Frontend runs at e.g. `http://localhost:5173`.

---

## 6. Usage

1. Open frontend in browser (`http://localhost:5173` or CRA port).
2. Login as teacher:

   - Employee ID: `T001`
   - Password: `1234`

3. In Teacher Dashboard:

   - Go to “Students” tab.
   - Add classes (e.g. “S3 CSE A”).
   - Add students with Admission number, Name, Password, and Class.

4. Period-wise attendance:

   - Go to “Attendance / Period-wise attendance”.
   - Select a class from the class cards.
   - Choose date (and move with previous/next buttons).
   - Mark P/A/U for each student and hour.
   - Click “Submit attendance”.

5. Student login:

   - Use Admission number and password assigned by teacher.
   - Student can:
     - View attendance for a date range.
     - See overall percentage.
     - Change password.

---

## 7. Environment variables (optional)

Instead of hardcoding DB credentials in `db.js`, use environment variables:

- `backend/.env`:

  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=
  DB_NAME=attendance_app
  ```

- Load with a library like `dotenv` in `db.js`.

---

## 8. Notes and limitations

- Authentication is basic; for production, add password hashing (bcrypt), sessions/tokens, and role-based access control.
- “Unmarked” is only in the frontend; in MySQL, only Present/Absent rows exist.
- Adjust classes and periods to match your college timetable.
- This project is for educational/internal use and respects intellectual property and copyright.

---

## 9. Scripts recap

Backend:

```
cd backend
npm install
node server.js
```

Frontend:

```
cd frontend
npm install
npm run dev
```

Access:

- Portal: `http://localhost:5173`
- API base: `http://localhost:4000/api`
```