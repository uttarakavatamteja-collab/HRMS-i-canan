const db = require('../config/db');

// GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const companyId = req.companyId;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Total employees (scoped by company)
    const totalEmployees = await db('employees')
      .where({ status: 'active', company_id: companyId })
      .count('id as count').first();

    // Total departments (scoped by company)
    const totalDepartments = await db('departments')
      .where({ is_active: true, company_id: companyId })
      .count('id as count').first();

    // Today's attendance (scoped by company)
    const todayAttendance = await db('attendance')
      .where({ date: today, company_id: companyId })
      .select('status')
      .count('id as count')
      .groupBy('status');

    const attendanceMap = {};
    todayAttendance.forEach((row) => {
      attendanceMap[row.status] = parseInt(row.count);
    });

    // Pending leaves (scoped by company)
    const pendingLeaves = await db('leaves')
      .where({ status: 'pending', company_id: companyId })
      .count('id as count').first();

    // This month's payroll stats (scoped by company)
    const payrollStats = await db('payroll')
      .where({ month: currentMonth, year: currentYear, company_id: companyId })
      .select('status')
      .sum('net_salary as total')
      .count('id as count')
      .groupBy('status');

    const payrollMap = {};
    payrollStats.forEach((row) => {
      payrollMap[row.status] = { count: parseInt(row.count), total: parseFloat(row.total) || 0 };
    });

    // Department-wise employee count (scoped by company)
    const departmentStats = await db('employees')
      .where({ 'employees.status': 'active', 'employees.company_id': companyId })
      .join('departments', 'employees.department_id', 'departments.id')
      .select('departments.name')
      .count('employees.id as count')
      .groupBy('departments.name');

    // Recent leaves (scoped by company)
    const recentLeaves = await db('leaves')
      .where('leaves.company_id', companyId)
      .join('employees', 'leaves.employee_id', 'employees.id')
      .join('users', 'employees.user_id', 'users.id')
      .select('leaves.*', 'users.first_name', 'users.last_name', 'employees.employee_code')
      .orderBy('leaves.created_at', 'desc')
      .limit(5);

    res.json({
      stats: {
        totalEmployees: parseInt(totalEmployees.count),
        totalDepartments: parseInt(totalDepartments.count),
        todayAttendance: attendanceMap,
        presentToday: attendanceMap.present || 0,
        pendingLeaves: parseInt(pendingLeaves.count),
        payroll: payrollMap,
      },
      departmentStats,
      recentLeaves,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
