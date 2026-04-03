import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { HiOutlineUsers, HiOutlineClipboardCheck, HiOutlineCalendar, HiOutlineCurrencyDollar, HiOutlineOfficeBuilding } from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Dashboard() {
  const { user, company, isAdmin, isHR, canManage } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setData(res.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const deptData = (data?.departmentStats || []).map((d) => ({ name: d.name, count: parseInt(d.count) }));

  const attendanceData = [
    { name: 'Present', value: stats.todayAttendance?.present || 0 },
    { name: 'Absent', value: stats.todayAttendance?.absent || 0 },
    { name: 'Late', value: stats.todayAttendance?.late || 0 },
    { name: 'Half-day', value: stats.todayAttendance?.['half-day'] || 0 },
  ].filter((d) => d.value > 0);

  const statCards = [
    { label: 'Total Employees', value: stats.totalEmployees || 0, icon: HiOutlineUsers, color: '#6366f1', bg: 'from-indigo-500/20 to-indigo-600/5' },
    { label: 'Present Today', value: stats.presentToday || 0, icon: HiOutlineClipboardCheck, color: '#10b981', bg: 'from-emerald-500/20 to-emerald-600/5' },
    { label: 'Pending Leaves', value: stats.pendingLeaves || 0, icon: HiOutlineCalendar, color: '#f59e0b', bg: 'from-amber-500/20 to-amber-600/5' },
    { label: 'Departments', value: stats.totalDepartments || 0, icon: HiOutlineOfficeBuilding, color: '#8b5cf6', bg: 'from-purple-500/20 to-purple-600/5' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-3 py-2">
          <p className="text-sm font-medium text-white">{label || payload[0].name}</p>
          <p className="text-xs text-indigo-300">{payload[0].value} {payload[0].name === 'count' ? 'employees' : ''}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          {company?.name ? `${company.name} — ` : ''}Welcome, {user?.first_name}! <span className="capitalize text-indigo-300/50">({user?.role})</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`glass-card-hover stat-card p-5 bg-gradient-to-br ${card.bg}`} style={{ '--accent-color': card.color }}>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl" style={{ background: `${card.color}20` }}>
                <card.icon size={22} style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-white/40 mt-1 font-medium">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Department Distribution */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Department Distribution</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData} barSize={32}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-white/30 text-sm">No department data</div>
          )}
        </div>

        {/* Attendance Overview */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white/80 mb-4">Today's Attendance</h3>
          {attendanceData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={250}>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                    {attendanceData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {attendanceData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-white/60">{item.name}</span>
                    <span className="text-xs font-semibold text-white ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-white/30 text-sm">No attendance marked today</div>
          )}
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white/80 mb-4">Recent Leave Requests</h3>
        {data?.recentLeaves?.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td className="font-medium text-white">{leave.first_name} {leave.last_name}</td>
                    <td className="capitalize">{leave.leave_type}</td>
                    <td>{new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${leave.status === 'approved' ? 'badge-success' : leave.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-white/30 text-sm py-8">No recent leave requests</p>
        )}
      </div>
    </div>
  );
}
