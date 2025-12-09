import { useEffect, useState } from 'react';
import api from './api';

function TeacherAttendanceManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attMap, setAttMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const toDateString = d => d.toISOString().slice(0, 10);

  const changeDateBy = days => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(toDateString(current));
  };

  const loadInitial = async () => {
    const [clsRes, perRes] = await Promise.all([
      api.get('/teacher/classes'),
      api.get('/teacher/periods')
    ]);
    setClasses(clsRes.data);
    setPeriods(perRes.data);
  };

  const loadData = async (classId, selectedDate) => {
    if (!classId || !periods.length) return;
    setLoading(true);
    try {
      const [stuRes, attRes] = await Promise.all([
        api.get('/teacher/students', { params: { class_id: classId } }),
        api.get('/teacher/attendance/periodwise', {
          params: { class_id: classId, date: selectedDate }
        })
      ]);
      const stu = stuRes.data;
      setStudents(stu);
      const map = {};
      stu.forEach(s => {
        map[s.id] = {};
        periods.forEach(p => {
          map[s.id][p.period_no] = 'unmarked';
        });
      });
      attRes.data.forEach(r => {
        if (!map[r.student_id]) map[r.student_id] = {};
        map[r.student_id][r.period_no] =
          r.status === 'present' || r.status === 'absent' ? r.status : 'unmarked';
      });
      setAttMap(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedClassId && periods.length) {
      loadData(selectedClassId, date);
    }
  }, [selectedClassId, date, periods]);

  const setStatus = (studentId, periodNo, status) => {
    setAttMap(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [periodNo]: status
      }
    }));
  };

  const submit = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const records = [];
      Object.entries(attMap).forEach(([studentId, byPeriod]) => {
        Object.entries(byPeriod).forEach(([pno, status]) => {
          if (status === 'present' || status === 'absent') {
            records.push({
              student_id: Number(studentId),
              period_no: Number(pno),
              status
            });
          }
        });
      });
      await api.post('/teacher/attendance/periodwise', {
        class_id: Number(selectedClassId),
        date,
        records
      });
      await loadData(selectedClassId, date);
    } finally {
      setSaving(false);
    }
  };

  if (!selectedClassId) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
          <h2 className="text-sm font-semibold text-slate-800">
            Select class to mark attendance
          </h2>
          <p className="text-[11px] text-slate-500">
            Choose a class to open the period-wise attendance panel.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {classes.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedClassId(String(c.id))}
              className="bg-white border border-slate-200 rounded-md shadow-sm px-4 py-3 text-left hover:border-sky-500 hover:shadow-md transition text-sm"
            >
              <div className="text-slate-800 font-semibold">
                {c.name}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Click to mark attendance for this class.
              </div>
            </button>
          ))}
          {classes.length === 0 && (
            <div className="text-xs text-slate-500">
              No classes yet. Please add classes in the Students screen.
            </div>
          )}
        </div>
      </div>
    );
  }

  const selectedClassName =
    classes.find(c => String(c.id) === String(selectedClassId))?.name || '';

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Period-wise attendance
          </h2>
          <p className="text-[11px] text-slate-500">
            Class: {selectedClassName || '—'}. Select date and mark Present/Absent for each hour.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setSelectedClassId('')}
            className="px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          >
            Change class
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeDateBy(-1)}
              className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              ◀
            </button>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-3 py-1.5 rounded border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <button
              type="button"
              onClick={() => changeDateBy(1)}
              className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              ▶
            </button>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={saving || loading}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded bg-sky-700 text-white font-semibold hover:bg-sky-800 disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Submit attendance'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm p-4">
        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="min-w-full text-[11px]">
            <thead className="bg-sky-50 border-b border-slate-200">
              <tr>
                <th className="px-2 py-2 text-left font-medium text-slate-600">
                  #
                </th>
                <th className="px-2 py-2 text-left font-medium text-slate-600">
                  Admission no
                </th>
                <th className="px-2 py-2 text-left font-medium text-slate-600">
                  Name
                </th>
                {periods.map(p => (
                  <th
                    key={p.id}
                    className="px-2 py-2 text-center font-medium text-slate-600"
                  >
                    H{p.period_no}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading && (
                <tr>
                  <td
                    colSpan={3 + periods.length}
                    className="px-3 py-3 text-center text-slate-500"
                  >
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                students.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="px-2 py-2 text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="px-2 py-2 font-mono text-slate-800">
                      {s.admission_no}
                    </td>
                    <td className="px-2 py-2 text-slate-800">
                      {s.name}
                    </td>
                    {periods.map(p => {
                      const status =
                        (attMap[s.id] && attMap[s.id][p.period_no]) ||
                        'unmarked';
                      return (
                        <td
                          key={p.id}
                          className="px-1 py-1 text-center align-middle"
                        >
                          <div className="flex flex-col items-center gap-1">
                            {status === 'present' && (
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300">
                                P
                              </span>
                            )}
                            {status === 'absent' && (
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-300">
                                A
                              </span>
                            )}
                            {status === 'unmarked' && (
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-300">
                                U
                              </span>
                            )}
                            <div className="inline-flex gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  setStatus(s.id, p.period_no, 'present')
                                }
                                className={`px-1.5 py-0.5 rounded border text-[10px] ${
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-white text-emerald-700 border-slate-300 hover:border-emerald-400'
                                }`}
                              >
                                P
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setStatus(s.id, p.period_no, 'absent')
                                }
                                className={`px-1.5 py-0.5 rounded border text-[10px] ${
                                  status === 'absent'
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-red-700 border-slate-300 hover:border-red-400'
                                }`}
                              >
                                A
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setStatus(s.id, p.period_no, 'unmarked')
                                }
                                className={`px-1.5 py-0.5 rounded border text-[10px] ${
                                  status === 'unmarked'
                                    ? 'bg-slate-200 text-slate-800 border-slate-300'
                                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                                }`}
                              >
                                U
                              </button>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              {!loading && students.length === 0 && (
                <tr>
                  <td
                    colSpan={3 + periods.length}
                    className="px-3 py-4 text-center text-slate-500"
                  >
                    No students in this class.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          U = Unmarked, P = Present, A = Absent for that hour.
        </p>
      </div>
    </div>
  );
}

export default TeacherAttendanceManager;
