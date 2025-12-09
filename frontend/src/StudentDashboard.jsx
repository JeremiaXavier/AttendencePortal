import { useEffect, useMemo, useState } from 'react';
import api from './api';

function StudentDashboard({ student, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [filter, setFilter] = useState({ from: '', to: '' });
  const [passwords, setPasswords] = useState({
    new_password: '',
    confirm: ''
  });
  const [loading, setLoading] = useState(false);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter.from) params.from = filter.from;
      if (filter.to) params.to = filter.to;
      const res = await api.get(`/student/attendance/${student.id}`, {
        params
      });
      setAttendance(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = e => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const applyFilter = () => {
    loadAttendance();
  };

  const changePassword = async e => {
    e.preventDefault();
    if (!passwords.new_password || passwords.new_password !== passwords.confirm) {
      return;
    }
    await api.put(`/student/password/${student.id}`, {
      new_password: passwords.new_password
    });
    setPasswords({ new_password: '', confirm: '' });
  };

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    attendance.forEach(a => {
      if (a.status === 'present') present += 1;
      if (a.status === 'absent') absent += 1;
    });
    const total = present + absent;
    const percentage = total ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, percentage };
  }, [attendance]);

  return (
    <div className="min-h-screen w-screen bg-slate-100">
      <header className="h-14 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 bg-sky-800 text-sky-50">
        <div>
          <h1 className="text-sm font-semibold tracking-tight">
            Student dashboard
          </h1>
          <p className="text-[11px] text-sky-100/90">
            View your attendance and update password
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="hidden sm:block text-right">
            <div className="font-medium text-sky-50">
              {student.admission_no}
            </div>
            <div className="text-sky-100/90">{student.name}</div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-sky-200 text-sky-900 font-semibold hover:bg-white"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-0 py-5 space-y-4">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
            <h2 className="text-xs font-semibold text-slate-700 mb-1">
              Overall attendance
            </h2>
            <p className="text-2xl font-semibold text-sky-800">
              {stats.percentage}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.present} present / {stats.absent} absent out of {stats.total}{' '}
              recorded days.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 flex flex-col justify-center">
            <h3 className="text-xs font-semibold text-slate-700">
              Present days
            </h3>
            <p className="text-lg font-semibold text-emerald-700">
              {stats.present}
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 flex flex-col justify-center">
            <h3 className="text-xs font-semibold text-slate-700">
              Absent days
            </h3>
            <p className="text-lg font-semibold text-red-700">
              {stats.absent}
            </p>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-md shadow-sm p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                My attendance
              </h2>
              <p className="text-[11px] text-slate-500">
                Choose a date range to view your attendance records.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="date"
                name="from"
                value={filter.from}
                onChange={handleFilterChange}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <span className="text-slate-500 text-[11px]">to</span>
              <input
                type="date"
                name="to"
                value={filter.to}
                onChange={handleFilterChange}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
              <button
                type="button"
                onClick={applyFilter}
                className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-sky-700 text-white font-semibold hover:bg-sky-800"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Date
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-3 text-center text-slate-500"
                    >
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading &&
                  attendance.map((a, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-2 text-slate-800">
                        {a.date.slice(0, 10)}
                      </td>
                      <td className="px-3 py-2">
                        {a.status === 'present' && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                            Present
                          </span>
                        )}
                        {a.status === 'absent' && (
                          <span className="inline-flex px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-300">
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                {!loading && attendance.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-3 py-3 text-center text-slate-500"
                    >
                      No attendance records for the selected dates.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-md shadow-sm p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-800">
            Change password
          </h2>
          <form
            onSubmit={changePassword}
            className="flex flex-col sm:flex-row gap-3 text-xs"
          >
            <input
              type="password"
              name="new_password"
              placeholder="New password"
              value={passwords.new_password}
              onChange={handlePasswordChange}
              className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <input
              type="password"
              name="confirm"
              placeholder="Confirm password"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              className="flex-1 px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-sky-700 text-white font-semibold hover:bg-sky-800"
            >
              Change
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
