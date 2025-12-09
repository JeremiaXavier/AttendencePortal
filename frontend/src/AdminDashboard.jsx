import { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export default function AdminDashboard({ user, onLogout }) {
  const [facultyUsername, setFacultyUsername] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');
  const [className, setClassName] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  // load faculty list for dropdown
  useEffect(() => {
    axios.get(`${API_BASE}/admin/faculty`).then((res) => setFacultyList(res.data));
  }, []);

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!facultyUsername || !facultyPassword) return;
    await axios.post(`${API_BASE}/admin/faculty`, {
      username: facultyUsername,
      password: facultyPassword,
    });
    alert('Faculty created');
    setFacultyUsername('');
    setFacultyPassword('');
    const res = await axios.get(`${API_BASE}/admin/faculty`);
    setFacultyList(res.data);
  };

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!className || !selectedFacultyId) return;
    await axios.post(`${API_BASE}/admin/classes`, {
      name: className,
      facultyId: Number(selectedFacultyId),
    });
    alert('Class created and assigned');
    setClassName('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: 220, background: '#333', color: 'white', padding: 16 }}>
        <h3>Admin</h3>
        <p>{user.username}</p>
        <button onClick={onLogout} style={{ width: '100%', marginTop: 16 }}>
          Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: 24 }}>
        <h2>Admin Dashboard</h2>

        <h3>Add Faculty</h3>
        <form onSubmit={handleAddFaculty}>
          <div>
            <label>Username: </label>
            <input
              value={facultyUsername}
              onChange={(e) => setFacultyUsername(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Password: </label>
            <input
              type="text"
              value={facultyPassword}
              onChange={(e) => setFacultyPassword(e.target.value)}
            />
          </div>
          <button type="submit" style={{ marginTop: 8 }}>
            Add Faculty
          </button>
        </form>

        <hr style={{ margin: '24px 0' }} />

        <h3>Create Class and Assign Faculty</h3>
        <form onSubmit={handleAddClass}>
          <div>
            <label>Class Name: </label>
            <input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label>Faculty: </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
            >
              <option value="">Select faculty</option>
              {facultyList.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.username}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" style={{ marginTop: 8 }}>
            Create Class
          </button>
        </form>
      </div>
    </div>
  );
}
