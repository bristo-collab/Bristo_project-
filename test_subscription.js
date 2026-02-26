import crypto from 'crypto';
import http from 'http';

const RAZORPAY_SECRET = 'GYCQW1U2WARvDxoTLQpdisZm';

async function runTest() {
    const razorpay_subscription_id = 'sub_verified_' + Date.now();
    const razorpay_payment_id = 'pay_verified_' + Date.now();

    const body = razorpay_payment_id + "|" + razorpay_subscription_id;
    const signature = crypto
        .createHmac('sha256', RAZORPAY_SECRET)
        .update(body.toString())
        .digest('hex');

    const testData = JSON.stringify({
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature: signature,
        userId: '65c2a1e4e4b0a1a2b3c4d5e6',
        userName: 'Test User Verified',
        email: 'verified@example.com',
        subscriptionType: 'Yearly Plan',
        amount: 4999
    });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/payment/verify',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(testData)
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log('Response Status:', res.statusCode);
            console.log('Response Body:', data);
            process.exit(0);
        });
    });

    req.on('error', (e) => {
        console.error('Request Error:', e);
        process.exit(1);
    });
    req.write(testData);
    req.end();
}

runTest();
