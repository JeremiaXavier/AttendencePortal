import { useState } from 'react';
import api from './api';
import TeacherDashboard from './TeacherDashboard';
import StudentDashboard from './StudentDashboard';

function getInitialAuth() {
  try {
    const saved = localStorage.getItem('attendance_user');
    if (!saved) return { role: '', teacher: null, student: null };
    const parsed = JSON.parse(saved);
    if (parsed.role === 'teacher') {
      return { role: 'teacher', teacher: parsed.teacher || null, student: null };
    }
    if (parsed.role === 'student') {
      return { role: 'student', teacher: null, student: parsed.student || null };
    }
    return { role: '', teacher: null, student: null };
  } catch {
    return { role: '', teacher: null, student: null };
  }
}

function App() {
  const [auth, setAuth] = useState(getInitialAuth);
  const { role, teacher, student } = auth;

  const [form, setForm] = useState({
    emp_id: '',
    t_password: '',
    admission_no: '',
    s_password: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const loginTeacher = async e => {
    e.preventDefault();
    const res = await api.post('/auth/teacher-login', {
      emp_id: form.emp_id,
      password: form.t_password
    });
    const data = { role: 'teacher', teacher: res.data.teacher, student: null };
    setAuth(data);
    localStorage.setItem('attendance_user', JSON.stringify(data));
    setForm({
      emp_id: '',
      t_password: '',
      admission_no: '',
      s_password: ''
    });
  };

  const loginStudent = async e => {
    e.preventDefault();
    const res = await api.post('/auth/student-login', {
      admission_no: form.admission_no,
      password: form.s_password
    });
    const data = { role: 'student', teacher: null, student: res.data.student };
    setAuth(data);
    localStorage.setItem('attendance_user', JSON.stringify(data));
    setForm({
      emp_id: '',
      t_password: '',
      admission_no: '',
      s_password: ''
    });
  };

  const logout = () => {
    setAuth({ role: '', teacher: null, student: null });
    localStorage.removeItem('attendance_user');
  };

  if (role === 'teacher' && teacher) {
    return <TeacherDashboard teacher={teacher} onLogout={logout} />;
  }

  if (role === 'student' && student) {
    return <StudentDashboard student={student} onLogout={logout} />;
  }

  return (
  <div className="min-h-screen w-screen bg-slate-100 flex flex-col">
    <header className="h-16 flex items-center px-4 md:px-10 bg-sky-900 text-sky-50 border-b border-sky-800">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-sky-700 flex items-center justify-center text-xs font-bold">
          AM
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">
             College Attendance Portal
          </div>
          <div className="text-[11px] text-sky-100/90">
            APJ Abdul Kalam Technological University – Internal Attendance
          </div>
        </div>
      </div>
    </header>

    <main className="flex-1 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800">
            Portal information
          </h2>
          <ul className="mt-3 space-y-2 text-[11px] text-slate-600">
            <li>
              Teachers can mark period-wise attendance and manage student records.
            </li>
            <li>
              Students can view attendance status and check overall percentage.
            </li>
            <li>
              Use the credentials issued by the institution. Do not share with others.
            </li>
          </ul>
          <div className="mt-4 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
            For any login issues, contact the department office.
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">
            Sign in to portal
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <form onSubmit={loginTeacher} className="space-y-4 border border-slate-200 rounded-md p-4 bg-slate-50">
              <h3 className="text-[12px] font-semibold text-slate-800">
                Teacher login
              </h3>
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Employee ID
                </label>
                <input
                  name="emp_id"
                  value={form.emp_id}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter employee ID"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Password
                </label>
                <input
                  name="t_password"
                  type="password"
                  value={form.t_password}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-1.5 rounded bg-sky-700 text-white text-xs font-semibold hover:bg-sky-800"
              >
                Login as teacher
              </button>
            </form>

            <form onSubmit={loginStudent} className="space-y-4 border border-slate-200 rounded-md p-4 bg-slate-50">
              <h3 className="text-[12px] font-semibold text-slate-800">
                Student login
              </h3>
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Admission number
                </label>
                <input
                  name="admission_no"
                  value={form.admission_no}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter admission number"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] text-slate-600">
                  Password
                </label>
                <input
                  name="s_password"
                  type="password"
                  value={form.s_password}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex justify-center items-center px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                Login as student
              </button>
            </form>
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            This portal is intended for internal use by Annmary College staff and students under KTU.
          </p>
        </div>
      </div>
    </main>

    <footer className="h-10 flex items-center justify-center bg-slate-200 text-[11px] text-slate-600 border-t border-slate-300">
      © {new Date().getFullYear()} MA College • APJ Abdul Kalam Technological University
    </footer>
  </div>
);
}

export default App;
