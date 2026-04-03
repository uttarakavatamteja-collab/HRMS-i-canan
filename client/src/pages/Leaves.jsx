import { useState, useEffect } from 'react';
import { leaveAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';

export default function Leaves() {
  const { canManage } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });

  useEffect(() => {
    fetchLeaves();
  }, [statusFilter]);

  const fetchLeaves = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const res = await leaveAPI.getAll(params);
      setLeaves(res.data.leaves);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await leaveAPI.apply(form);
      setShowForm(false);
      setForm({ leave_type: 'casual', start_date: '', end_date: '', reason: '' });
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await leaveAPI.updateStatus(id, { status });
      fetchLeaves();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      case 'pending': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="text-sm text-white/40 mt-1">Manage leave requests</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <HiOutlinePlus size={18} /> Apply for Leave
        </button>
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">New Leave Request</h3>
          <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Leave Type</label>
              <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })} className="select-field">
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="maternity">Maternity Leave</option>
                <option value="paternity">Paternity Leave</option>
                <option value="unpaid">Unpaid Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Start Date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">End Date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary justify-center">Submit Request</button>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs text-white/50 mb-1.5">Reason</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="input-field" placeholder="Brief reason for leave..." />
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-white/50">Filter:</label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto">
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canManage ? 7 : 6)].map((_, j) => (
                      <td key={j}><div className="skeleton h-5 w-20 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="text-center py-12 text-white/30">No leave requests found</td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="font-medium text-white">{leave.first_name} {leave.last_name}</td>
                    <td className="capitalize">{leave.leave_type}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()}</td>
                    <td>{new Date(leave.end_date).toLocaleDateString()}</td>
                    <td className="max-w-[200px] truncate text-white/50">{leave.reason || '—'}</td>
                    <td><span className={`badge ${getBadgeClass(leave.status)}`}>{leave.status}</span></td>
                    {canManage && (
                      <td>
                        {leave.status === 'pending' && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleUpdateStatus(leave.id, 'approved')} className="p-1.5 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Approve">
                              <HiOutlineCheck size={16} />
                            </button>
                            <button onClick={() => handleUpdateStatus(leave.id, 'rejected')} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Reject">
                              <HiOutlineX size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/40">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchLeaves(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Previous</button>
              <button onClick={() => fetchLeaves(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
