const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = 'admin@healthkart.com';
const ADMIN_PASSWORD = 'adminpassword123';
const LOG_FILE = path.join(__dirname, 'verification.log');

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyNotifications() {
    try {
        fs.writeFileSync(LOG_FILE, ''); // Clear log
    } catch (e) { } // Ignore if file doesn't exist

    try {
        log('--- Starting Notification System Verification ---');

        // 1. Create a User
        const userEmail = `testuser_${Date.now()}@example.com`;
        const userPassword = 'password123';
        log(`Creating test user: ${userEmail}`);

        let otpCode;
        let userId;

        try {
            const signupRes = await axios.post(`${API_URL}/auth/signup`, {
                fullName: 'Test User',
                email: userEmail,
                password: userPassword,
                phone: `99${Date.now().toString().slice(-8)}`
            });
            otpCode = signupRes.data.devOtp;
            userId = signupRes.data.userId;
            log(`✅ Signup successful. OTP: ${otpCode}`);
        } catch (e) {
            log('Signup failed (might exist): ' + e.message);
            // If user exists, we can't easily get OTP unless we implement resend or login.
            // Assumption: we are creating a fresh user every time with unique email.
            // If signup failed, verify/login might fail.
            throw e;
        }

        // 1.5 Verify OTP
        log('Verifying OTP...');
        await axios.post(`${API_URL}/auth/verify-otp`, {
            userId,
            otp: otpCode
        });
        log('✅ OTP Verified');

        // 2. Login as User
        log('Logging in as User...');
        const userLoginRes = await axios.post(`${API_URL}/auth/signin`, {
            emailOrPhone: userEmail,
            password: userPassword
        });
        const userToken = userLoginRes.data.token;
        const userConfig = { headers: { Authorization: `Bearer ${userToken}` } };
        log('✅ User logged in');

        // 3. Create an Order
        log('Creating a test order...');
        const dummyOrderId = `HK-TEST-${Date.now()}`;
        const orderRes = await axios.post(`${API_URL}/payment/order/create`, {
            orderDetails: {
                orderId: dummyOrderId,
                total: 500,
                subtotal: 450,
                shippingFee: 50,
                items: [{ name: 'Test Product', price: 450, quantity: 1 }],
                billingInfo: { fullName: 'Test User', address: '123 Test St', city: 'Test City' }
            }
        }, userConfig);
        const orderId = orderRes.data.order.orderId;
        log(`✅ Order created: ${orderId}`);

        // 4. Cancel the Order
        log('Cancelling the order...');
        await axios.patch(`${API_URL}/payment/order/cancel`, { orderId }, userConfig);
        log('✅ Order cancelled by user');

        // 5. Login as Admin
        log('Logging in as Admin...');
        const adminLoginRes = await axios.post(`${API_URL}/auth/signin`, {
            emailOrPhone: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const adminToken = adminLoginRes.data.token;
        const adminConfig = { headers: { Authorization: `Bearer ${adminToken}` } };
        log('✅ Admin logged in');

        // 6. Fetch Notifications
        log('Fetching Admin Notifications...');
        await delay(2000);
        const notifRes = await axios.get(`${API_URL}/notifications`, adminConfig);

        const notifications = notifRes.data.notifications;
        log(`Fetched ${notifications.length} notifications`);

        // 7. Verify Cancellation Notification
        const cancellationNotif = notifications.find(n =>
            n.type === 'order_cancelled' &&
            (n.data?.orderId === orderId || (n.message && n.message.includes(orderId)))
        );

        if (cancellationNotif) {
            log('✅ SUCCESS: Cancellation notification found!');
            log('Notification Details: ' + JSON.stringify(cancellationNotif, null, 2));
        } else {
            log('❌ FAILURE: Cancellation notification NOT found for order ' + orderId);
            log('Recent notifications: ' + JSON.stringify(notifications.slice(0, 3), null, 2));
            process.exit(1);
        }

        log('--- Verification Complete ---');
        process.exit(0);

    } catch (error) {
        log('❌ Verification Failed:');
        log('Error Message: ' + error.message);
        log('Error Code: ' + error.code);
        log('Full Error: ' + JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        if (error.response) {
            log('Status: ' + error.response.status);
            log('Data: ' + JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

verifyNotifications();
