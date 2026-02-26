import crypto from 'crypto';
import http from 'http';

const RAZORPAY_SECRET = 'GYCQW1U2WARvDxoTLQpdisZm';

async function runTest(subId) {
    const razorpay_subscription_id = subId;
    const razorpay_payment_id = 'pay_dup_' + Date.now();

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
        userName: 'Test User Duplicate',
        email: 'dup@example.com',
        subscriptionType: 'Monthly Plan',
        amount: 499
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

    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`Response for ${subId}:`, res.statusCode, data);
                resolve();
            });
        });
        req.write(testData);
        req.end();
    });
}

const sharedId = 'shared_sub_123';
console.log('--- Attempt 1 ---');
await runTest(sharedId);
console.log('--- Attempt 2 (Duplicate) ---');
await runTest(sharedId);
process.exit(0);
