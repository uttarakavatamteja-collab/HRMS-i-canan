import { useState, useEffect } from 'react';
import { payrollAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCurrencyDollar, HiOutlineCheck } from 'react-icons/hi';

export default function Payroll() {
  const { canManage } = useAuth();
  const [payroll, setPayroll] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');

  useEffect(() => {
    fetchPayroll();
  }, [filterMonth, filterYear]);

  const fetchPayroll = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (filterMonth) params.month = filterMonth;
      if (filterYear) params.year = filterYear;
      const res = await payrollAPI.getAll(params);
      setPayroll(res.data.payroll);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await payrollAPI.generate({ month: genMonth, year: genYear });
      fetchPayroll();
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = async (id) => {
    try {
      await payrollAPI.updateStatus(id, { status: 'paid' });
      fetchPayroll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcess = async (id) => {
    try {
      await payrollAPI.updateStatus(id, { status: 'processed' });
      fetchPayroll();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'processed': return 'badge-info';
      case 'pending': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="text-sm text-white/40 mt-1">Manage monthly payroll</p>
        </div>
      </div>

      {/* Generate Payroll */}
      {canManage && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Generate Monthly Payroll</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Month</label>
              <select value={genMonth} onChange={(e) => setGenMonth(parseInt(e.target.value))} className="select-field w-auto">
                {months.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Year</label>
              <select value={genYear} onChange={(e) => setGenYear(parseInt(e.target.value))} className="select-field w-auto">
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary disabled:opacity-50">
              <HiOutlineCurrencyDollar size={18} />
              {generating ? 'Generating...' : 'Generate Payroll'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-white/50">Filter:</label>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="select-field w-auto">
          <option value="">All Months</option>
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="select-field w-auto">
          <option value="">All Years</option>
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(canManage ? 8 : 7)].map((_, j) => (
                      <td key={j}><div className="skeleton h-5 w-20 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : payroll.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="text-center py-12 text-white/30">No payroll records found</td>
                </tr>
              ) : (
                payroll.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div>
                        <p className="font-medium text-white">{record.first_name} {record.last_name}</p>
                        <p className="text-xs text-white/40">{record.designation}</p>
                      </div>
                    </td>
                    <td>{months[record.month - 1]} {record.year}</td>
                    <td>{formatCurrency(record.basic_salary)}</td>
                    <td className="text-emerald-400">{formatCurrency(record.allowances)}</td>
                    <td className="text-red-400">{formatCurrency(record.deductions)}</td>
                    <td className="font-semibold text-white">{formatCurrency(record.net_salary)}</td>
                    <td><span className={`badge ${getBadgeClass(record.status)}`}>{record.status}</span></td>
                    {canManage && (
                      <td>
                        <div className="flex items-center gap-1">
                          {record.status === 'pending' && (
                            <button onClick={() => handleProcess(record.id)} className="btn-secondary text-xs py-1 px-2.5">Process</button>
                          )}
                          {record.status === 'processed' && (
                            <button onClick={() => handleMarkPaid(record.id)} className="btn-success text-xs py-1 px-2.5 flex items-center gap-1">
                              <HiOutlineCheck size={14} /> Paid
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

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <p className="text-xs text-white/40">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchPayroll(pagination.page - 1)} disabled={pagination.page <= 1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Previous</button>
              <button onClick={() => fetchPayroll(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
