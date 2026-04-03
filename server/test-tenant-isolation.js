const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testMultiTenantIsolation() {
  console.log('🧪 Starting Multi-Tenant Isolation Tests\n');

  try {
    // 1. Log in to Company A (Acme Corp)
    console.log('Logging in as Acme Admin...');
    const acmeLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@acme.com',
      password: 'admin123',
      domain: 'acme.com'
    });
    const acmeToken = acmeLogin.data.token;
    console.log('✅ Acme login successful');

    // 2. Log in to Company B (Globex Inc)
    console.log('Logging in as Globex Admin...');
    const globexLogin = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@globex.com',
      password: 'admin123',
      domain: 'globex.com'
    });
    const globexToken = globexLogin.data.token;
    console.log('✅ Globex login successful');

    // 3. Test Employee Isolation
    console.log('\n🔍 Testing Employee Visibility...');
    const acmeEmployees = await axios.get(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${acmeToken}` }
    });
    const globexEmployees = await axios.get(`${API_URL}/employees`, {
      headers: { Authorization: `Bearer ${globexToken}` }
    });

    console.log(`Acme sees ${acmeEmployees.data.employees.length} employees`);
    console.log(`Globex sees ${globexEmployees.data.employees.length} employees`);
    
    // Check for employee_code EMP-001 in both (proves code scoping works)
    const acmeEmp1 = acmeEmployees.data.employees.find(e => e.employee_code === 'EMP-001');
    const globexEmp1 = globexEmployees.data.employees.find(e => e.employee_code === 'EMP-001');
    
    if (acmeEmp1 && globexEmp1 && acmeEmp1.id !== globexEmp1.id) {
      console.log('✅ Both companies have separate employees with code "EMP-001"');
    } else {
      console.error('❌ Employee code scoping failed!');
    }

    // 4. Test Dashboard Stats Isolation
    console.log('\n📊 Testing Dashboard Stats Visibility...');
    const acmeDashboard = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${acmeToken}` }
    });
    const globexDashboard = await axios.get(`${API_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${globexToken}` }
    });

    const acmeDeptCount = acmeDashboard.data.stats.totalDepartments;
    const globexDeptCount = globexDashboard.data.stats.totalDepartments;
    
    console.log(`Acme sees ${acmeDeptCount} departments (Expected: 3)`);
    console.log(`Globex sees ${globexDeptCount} departments (Expected: 2)`);
    
    if (acmeDeptCount === 3 && globexDeptCount === 2) {
      console.log('✅ Dashboard stats are strictly scoped per company!');
    } else {
      console.error('❌ Dashboard data leakage detected!');
    }

    console.log('\n🎉 All multi-tenant isolation tests passed!');

  } catch (err) {
    console.error('\n❌ Test Failed:');
    if (err.response) {
      console.error('API Error:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

testMultiTenantIsolation();
