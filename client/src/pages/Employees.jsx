import { useState, useEffect } from 'react';
import { employeeAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

export default function Employees() {
  const { canManage, isAdmin } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState({ department_id: '', designation: '', phone: '', salary: '', status: 'active' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async (page = 1) => {
    setLoading(true);
    try {
      const res = await employeeAPI.getAll({ page, limit: 10, search });
      setEmployees(res.data.employees);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setForm({
      department_id: emp.department_id || '',
      designation: emp.designation || '',
      phone: emp.phone || '',
      salary: emp.salary || '',
      status: emp.status || 'active',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.update(editingEmployee.id, form);
      setShowModal(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeAPI.delete(id);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-warning';
      case 'terminated': return 'badge-danger';
      default: return 'badge-neutral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-sm text-white/40 mt-1">{pagination.total || 0} total employees</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search by name, email, or code..."
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Phone</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canManage ? 7 : 6)].map((_, j) => (
                      <td key={j}><div className="skeleton h-5 w-24 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="text-center py-12 text-white/30">
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {emp.first_name?.[0]}{emp.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white">{emp.first_name} {emp.last_name}</p>
                          <p className="text-xs text-white/40">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-indigo-300 text-xs">{emp.employee_code}</td>
                    <td>{emp.department_name || '—'}</td>
                    <td>{emp.designation || '—'}</td>
                    <td>{emp.phone || '—'}</td>
                    <td><span className={`badge ${getBadgeClass(emp.status)}`}>{emp.status}</span></td>
                    {canManage && (
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(emp)} className="p-1.5 rounded-lg text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                            <HiOutlinePencil size={16} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => handleDelete(emp.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                              <HiOutlineTrash size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/40">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchEmployees(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => fetchEmployees(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Edit Employee</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10">
                <HiOutlineX size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Designation</label>
                <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Salary</label>
                <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="select-field">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary flex-1 justify-center">Save Changes</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
