import { useState, useEffect } from 'react';
import { attendanceAPI, employeeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendar, HiOutlineCheck, HiOutlineX as HiX } from 'react-icons/hi';

export default function Attendance() {
  const { canManage } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [pagination, setPagination] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [markForm, setMarkForm] = useState({ employee_id: '', status: 'present', check_in: '09:00', check_out: '18:00' });

  useEffect(() => {
    fetchAttendance();
    if (canManage) fetchEmployees();
  }, [date]);

  const fetchAttendance = async (page = 1) => {
    setLoading(true);
    try {
      const res = await attendanceAPI.getAll({ date, page, limit: 20 });
      setAttendance(res.data.attendance);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll({ limit: 100 });
      setEmployees(res.data.employees);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.mark({ ...markForm, date });
      setShowMarkForm(false);
      setMarkForm({ employee_id: '', status: 'present', check_in: '09:00', check_out: '18:00' });
      fetchAttendance();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'present': return 'badge-success';
      case 'absent': return 'badge-danger';
      case 'late': return 'badge-warning';
      case 'half-day': return 'badge-info';
      case 'on-leave': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-sm text-white/40 mt-1">Track daily attendance records</p>
        </div>
        {canManage && (
          <button onClick={() => setShowMarkForm(!showMarkForm)} className="btn-primary">
            <HiOutlineCalendar size={18} /> Mark Attendance
          </button>
        )}
      </div>

      {/* Mark Attendance Form */}
      {showMarkForm && canManage && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Mark Attendance for {date}</h3>
          <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Employee</label>
              <select value={markForm.employee_id} onChange={(e) => setMarkForm({ ...markForm, employee_id: e.target.value })} className="select-field" required>
                <option value="">Select...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Status</label>
              <select value={markForm.status} onChange={(e) => setMarkForm({ ...markForm, status: e.target.value })} className="select-field">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half-day">Half Day</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Check In</label>
              <input type="time" value={markForm.check_in} onChange={(e) => setMarkForm({ ...markForm, check_in: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Check Out</label>
              <input type="time" value={markForm.check_out} onChange={(e) => setMarkForm({ ...markForm, check_out: e.target.value })} className="input-field" />
            </div>
            <button type="submit" className="btn-primary justify-center">
              <HiOutlineCheck size={18} /> Save
            </button>
          </form>
        </div>
      )}

      {/* Date Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/50">Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-auto" />
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j}><div className="skeleton h-5 w-20 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30">
                    No attendance records for this date
                  </td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="font-medium text-white">{record.first_name} {record.last_name}</td>
                    <td className="font-mono text-indigo-300 text-xs">{record.employee_code}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>{record.check_in || '—'}</td>
                    <td>{record.check_out || '—'}</td>
                    <td><span className={`badge ${getBadgeClass(record.status)}`}>{record.status}</span></td>
                    <td className="text-white/50 max-w-[200px] truncate">{record.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
