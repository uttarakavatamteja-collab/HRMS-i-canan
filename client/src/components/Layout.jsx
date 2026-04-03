import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineCalendar,
  HiOutlineCurrencyDollar,
  HiOutlineLogout,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
} from 'react-icons/hi';

const navItems = [
  { path: '/', icon: HiOutlineViewGrid, label: 'Dashboard' },
  { path: '/employees', icon: HiOutlineUsers, label: 'Employees' },
  { path: '/attendance', icon: HiOutlineClipboardCheck, label: 'Attendance' },
  { path: '/leaves', icon: HiOutlineCalendar, label: 'Leaves' },
  { path: '/payroll', icon: HiOutlineCurrencyDollar, label: 'Payroll' },
];

export default function Layout() {
  const { user, company, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-gradient-to-b from-[#0f0c29]/95 to-[#1e1b4b]/95 backdrop-blur-xl border-r border-white/[0.06]`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-white/[0.06]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-indigo-500/25">
            HR
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">{company?.name || 'HRMS Pro'}</h1>
            <p className="text-[0.65rem] text-indigo-300/60 font-medium uppercase tracking-widest">Management Suite</p>
          </div>
          <button
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-white border border-indigo-500/20 shadow-lg shadow-indigo-500/5'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`
              }
            >
              <item.icon size={20} className="shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-indigo-300/50 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Logout"
            >
              <HiOutlineLogout size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-white/[0.06] bg-black/20 backdrop-blur-lg shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <HiOutlineMenu size={22} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors">
              <HiOutlineBell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <span className="text-sm text-white/70 font-medium">{user?.first_name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
