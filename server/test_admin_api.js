const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@healthkart.com';
const ADMIN_PASSWORD = 'adminpassword123';

async function testAdminAPI() {
    try {
        console.log('--- Starting Admin API Tests ---');

        // 1. Auth: Sign In
        console.log('Testing Admin Login...');
        const loginRes = await axios.post(`${API_URL}/auth/signin`, {
            emailOrPhone: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('✅ Auth success');

        // 2. Dashboard Stats
        console.log('Testing Admin Stats...');
        const statsRes = await axios.get(`${API_URL}/admin/stats`, config);
        console.log('✅ Stats fetched:', JSON.stringify(statsRes.data, null, 2));

        // 3. Products Management
        console.log('Testing Product Creation...');
        const prodRes = await axios.post(`${API_URL}/admin/products`, {
            name: 'Test Supplement',
            price: 999,
            category: 'Testing',
            brand: 'AdminTest'
        }, config);
        const prodId = prodRes.data.product._id;
        console.log('✅ Product created:', prodId);

        console.log('Testing Product List...');
        const productsRes = await axios.get(`${API_URL}/admin/products`, config);
        console.log(`✅ Products count: ${productsRes.data.length}`);

        // 4. User Management
        console.log('Testing User List...');
        const usersRes = await axios.get(`${API_URL}/admin/users`, config);
        console.log(`✅ Users count: ${usersRes.data.length}`);

        console.log('--- Admin API Tests Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('❌ Admin API Test Failed:', error.response?.data || error.message);
        process.exit(1);
    }
}

testAdminAPI();
