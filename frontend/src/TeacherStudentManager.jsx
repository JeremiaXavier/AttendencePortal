import { useEffect, useState } from 'react';
import api from './api';

function TeacherStudentManager() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);

  const [classForm, setClassForm] = useState({ name: '' });

  const [studentForm, setStudentForm] = useState({
    admission_no: '',
    name: '',
    password: '',
    class_id: ''
  });

  const loadClasses = async () => {
    const res = await api.get('/teacher/classes');
    setClasses(res.data);
  };

  const loadStudents = async () => {
    const res = await api.get('/teacher/students');
    setStudents(res.data);
  };

  useEffect(() => {
    loadClasses();
    loadStudents();
  }, []);

  const handleClassChange = e => {
    setClassForm({ ...classForm, [e.target.name]: e.target.value });
  };

  const handleStudentChange = e => {
    setStudentForm({ ...studentForm, [e.target.name]: e.target.value });
  };

  const submitClass = async e => {
    e.preventDefault();
    if (!classForm.name.trim()) return;
    await api.post('/teacher/classes', { name: classForm.name.trim() });
    setClassForm({ name: '' });
    loadClasses();
  };

  const submitStudent = async e => {
    e.preventDefault();
    if (
      !studentForm.admission_no.trim() ||
      !studentForm.name.trim() ||
      !studentForm.password.trim() ||
      !studentForm.class_id
    ) {
      return;
    }
    await api.post('/teacher/students', {
      admission_no: studentForm.admission_no.trim(),
      name: studentForm.name.trim(),
      password: studentForm.password.trim(),
      class_id: Number(studentForm.class_id)
    });
    setStudentForm({
      admission_no: '',
      name: '',
      password: '',
      class_id: ''
    });
    loadStudents();
  };

  const classNameById = id => {
    const c = classes.find(x => x.id === id);
    return c ? c.name : '';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Add class
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Create a class (e.g. S3 CSE A, S5 ECE B) before assigning students.
        </p>
        <form
          onSubmit={submitClass}
          className="flex flex-col sm:flex-row gap-3 text-xs"
        >
          <input
            name="name"
            value={classForm.name}
            onChange={handleClassChange}
            className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="e.g. S3 CSE A"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-sky-700 text-white font-semibold hover:bg-sky-800"
          >
            Save class
          </button>
        </form>

        <div className="mt-3 text-[11px] text-slate-600">
          Existing classes:
          <span className="ml-1 font-medium">
            {classes.length
              ? classes.map(c => c.name).join(', ')
              : ' none'}
          </span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
        <h2 className="text-sm font-semibold text-slate-800">
          Add student
        </h2>
        <p className="text-[11px] text-slate-500 mb-3">
          Assign each student to a class and give an initial password.
        </p>
        <form
          onSubmit={submitStudent}
          className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
        >
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Admission number
            </label>
            <input
              name="admission_no"
              value={studentForm.admission_no}
              onChange={handleStudentChange}
              className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="AM2025-001"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Name
            </label>
            <input
              name="name"
              value={studentForm.name}
              onChange={handleStudentChange}
              className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Student name"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Class
            </label>
            <select
              name="class_id"
              value={studentForm.class_id}
              onChange={handleStudentChange}
              className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="">Select class</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] text-slate-600">
              Initial password
            </label>
            <input
              name="password"
              value={studentForm.password}
              onChange={handleStudentChange}
              className="w-full px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              placeholder="Temporary password"
            />
          </div>
          <div className="md:col-span-4 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-sky-700 text-white font-semibold hover:bg-sky-800"
            >
              Save student
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">
          Students
        </h3>
        <div className="border border-slate-200 rounded overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  #
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Admission no
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-slate-600">
                  Class
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {students.map((s, idx) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-800">
                    {s.admission_no}
                  </td>
                  <td className="px-3 py-2 text-slate-800">
                    {s.name}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {classNameById(s.class_id)}
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-center text-slate-500"
                  >
                    No students yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TeacherStudentManager;
