const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const { Server } = require('socket.io');
const { createServer } = require('http');
const crypto = require('crypto'); // Keep crypto as it was not explicitly removed by the user's edit

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

const notificationSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'new_order', 'new_user', 'order_cancelled', etc.
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);

// Helper to broadcast notifications
const notifyAdmin = async (type, data) => {
    // 1. Construct Notification Data
    let title = 'New Notification';
    let message = 'You have a new update.';

    if (type === 'new_user') {
        title = 'New User Signup';
        message = `${data.name} has joined the platform.`;
    } else if (type === 'new_order') {
        title = 'New Order Received';
        message = `Order #${data.orderId} received from ${data.customer} (₹${data.amount})`;
    } else if (type === 'order_cancelled') {
        title = data.title || 'Order Cancelled';
        message = data.message || `Order #${data.orderId} was cancelled.`;
    }

    // 2. Save to Database
    try {
        const newNotification = new Notification({
            type,
            title,
            message,
            data
        });
        await newNotification.save();
        console.log('🔔 Notification saved to DB:', title);

        // 3. Emit via Socket
        io.emit('admin_notification', {
            _id: newNotification._id,
            type,
            title,
            message,
            data,
            createdAt: newNotification.createdAt
        });
    } catch (error) {
        console.error('❌ Failed to save notification:', error);
    }
};

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hk_db';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-prod';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        console.log('Database Name:', mongoose.connection.name);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.error('Error Code:', err.code);
        // Do not crash the entire process immediately, but log it clearly
    });

// Schemas & Models
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls if using phone
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    address: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const otpSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    otpCode: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const OtpVerification = mongoose.model('OtpVerification', otpSchema);

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: String,
    subCategory: String,
    brand: String,
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: String,
    tags: [String],
    stock: { type: Number, default: 0 },
    flavors: [String],
    weight: String,
    isActive: { type: Boolean, default: true },
    costPrice: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    reviewItems: [{
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const subscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    email: { type: String, required: true },
    subscriptionType: { type: String, required: true },
    amount: { type: Number, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_subscription_id: { type: String, unique: true, required: true }, // Added unique constraint
    paymentStatus: { type: String, default: 'completed' },
    status: { type: String, default: 'active' }, // Added status field
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true },
    transactionId: { type: String, unique: true },
    paymentId: { type: String },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['payment', 'refund'], required: true },
    status: { type: String, enum: ['success', 'failed', 'pending'], default: 'pending' },
    method: { type: String },
    description: String,
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, unique: true, required: true },
    items: [{
        id: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String,
        selectedFlavor: String,
        selectedWeight: String
    }],
    total: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
    status: { type: String, default: 'Processing' }, // Processing, Shipped, Delivered, Cancelled
    billingInfo: {
        fullName: String,
        email: String,
        phone: String,
        address: String,
        city: String,
        state: String
    },
    pincode: String,
    razorpayOrderId: String,
    refundId: String,
    orderDate: { type: Date, default: Date.now },
    tracking: {
        currentStage: { type: Number, default: 1 },
        stages: { type: [String], default: ['Ordered', 'Packed', 'Shipped', 'Delivered'] }
    },
    refundStatus: { type: String, enum: ['None', 'Requested', 'Completed', 'Failed'], default: 'None' },
    invoiceId: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = decoded;
        next();
    });
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Auth middleware error' });
    }
};

const isUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'user') {
            return res.status(403).json({ error: 'Access denied. Only registered customers allowed.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ error: 'Auth middleware error' });
    }
};

// Routes

// 0. Get Notifications (Admin)
app.get('/api/notifications', authenticateToken, isAdmin, async (req, res) => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification.countDocuments({ isRead: false });
        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.patch('/api/notifications/mark-read', authenticateToken, isAdmin, async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to mark notifications as read' });
    }
});

// 1. Sign Up
app.post('/api/auth/signup', async (req, res) => {
    const { fullName, email, phone, password } = req.body;

    // Basic Validation
    if (!fullName || (!email && !phone) || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Check if user exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email or phone' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const newUser = new User({
            fullName,
            email,
            phone,
            passwordHash: hashedPassword
        });
        await newUser.save();

        // Generate OTP
        const otpCode = Math.floor(10000 + Math.random() * 90000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60000); // 5 mins

        // Save OTP
        const otpRecord = new OtpVerification({
            userId: newUser._id,
            otpCode,
            expiresAt
        });
        await otpRecord.save();

        console.log(`[DEV] OTP for ${email || phone}: ${otpCode}`);

        res.status(201).json({
            message: 'User created. OTP sent.',
            userId: newUser._id,
            devOtp: otpCode
        });

        // Notify Admin
        notifyAdmin('new_user', {
            id: newUser._id,
            name: newUser.fullName,
            email: newUser.email
        });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: 'Server error during signup' });
    }
});

// 2. Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) return res.status(400).json({ error: 'Missing userId or otp' });

    try {
        const otpRecord = await OtpVerification.findOne({
            userId,
            otpCode: otp,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Mark OTP as used
        otpRecord.isUsed = true;
        await otpRecord.save();

        // Mark User as verified
        await User.findByIdAndUpdate(userId, { isVerified: true });

        res.json({ success: true, message: 'Account verified successfully' });

    } catch (error) {
        console.error("OTP Verification error:", error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// 3. Sign In
app.post('/api/auth/signin', async (req, res) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
        return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    try {
        const user = await User.findOne({
            $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
        });

        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Account not verified. Please verify OTP.' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.fullName, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Signin error:", error);
        res.status(500).json({ error: 'Server error during signin' });
    }
});

const paymentRouter = express.Router();

// 4. Create Razorpay Order (One-time)
paymentRouter.post('/create-order', async (req, res) => {
    const { amount, currency = 'INR' } = req.body;

    if (!amount) return res.status(400).json({ error: 'Amount is required' });

    try {
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects paise
            currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount
        });
    } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// 5. Create Razorpay Subscription
paymentRouter.post('/create-subscription', async (req, res) => {
    const { amount, name, currency = 'INR' } = req.body;

    try {
        // 1. Create a Plan
        const plan = await razorpay.plans.create({
            period: 'monthly',
            interval: 1,
            item: {
                name: `Subscription: ${name}`,
                amount: Math.round(amount * 100),
                currency: currency
            }
        });

        // 2. Create the Subscription
        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.id,
            total_count: 12, // For 1 year
            quantity: 1,
            customer_notify: 1
        });

        res.json({
            id: subscription.id,
            plan_id: plan.id
        });
    } catch (error) {
        console.error("Razorpay Subscription Error:", error);
        res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// 6. Verify Razorpay Payment (Order or Subscription)
paymentRouter.post('/verify', async (req, res) => {
    console.log("DEBUG: Verification Request Body:", req.body);

    const {
        razorpay_order_id,
        razorpay_subscription_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        userName,
        email,
        subscriptionType,
        amount
    } = req.body;

    try {
        let expectedSignature = '';
        let isSubscription = false;

        if (razorpay_order_id) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_SECRET)
                .update(body.toString())
                .digest('hex');
        } else if (razorpay_subscription_id) {
            const body = razorpay_payment_id + "|" + razorpay_subscription_id;
            expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_SECRET)
                .update(body.toString())
                .digest('hex');
            isSubscription = true;
        }

        if (expectedSignature === razorpay_signature) {
            if (isSubscription) {
                // Prevent duplicate subscriptions
                const existing = await Subscription.findOne({ razorpay_subscription_id });
                if (existing) {
                    console.log(`⚠️ Subscription ${razorpay_subscription_id} already exists.`);
                    return res.json({ success: true, message: 'Subscription already processed' });
                }

                if (userId && subscriptionType && amount) {
                    const startDate = new Date();
                    let endDate = new Date();
                    if (subscriptionType.toLowerCase().includes('monthly') || subscriptionType.toLowerCase().includes('month')) {
                        const months = parseInt(subscriptionType) || 1;
                        endDate.setMonth(endDate.getMonth() + months);
                    } else if (subscriptionType.toLowerCase().includes('yearly') || subscriptionType.toLowerCase().includes('year')) {
                        const years = parseInt(subscriptionType) || 1;
                        endDate.setFullYear(endDate.getFullYear() + years);
                    } else if (subscriptionType.toLowerCase().includes('day')) {
                        const days = parseInt(subscriptionType) || 15;
                        endDate.setDate(endDate.getDate() + days);
                    } else {
                        endDate.setMonth(endDate.getMonth() + 1);
                    }

                    const newSubscription = new Subscription({
                        userId,
                        userName,
                        email,
                        subscriptionType,
                        amount,
                        razorpay_payment_id,
                        razorpay_subscription_id,
                        paymentStatus: 'completed',
                        startDate,
                        endDate
                    });

                    await newSubscription.save();
                    console.log(`✅ Subscription successfully saved for user: ${userId}`);
                } else {
                    console.warn("⚠️ Subscription verified but missing required metadata for DB recording.");
                }
            }

            return res.json({ success: true, message: 'Payment verified and recorded successfully' });
        } else {
            console.error("❌ Signature Mismatch. Expected:", expectedSignature, "Received:", razorpay_signature);
            return res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error("❌ Verification Process Error:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Subscription already exists' });
        }
        return res.status(500).json({ error: 'Verification failed during database operation' });
    }
});

// 7. Update Active Subscription Details
paymentRouter.patch('/subscription/update', async (req, res) => {
    const { subscriptionId, ...updateData } = req.body;
    const userId = req.user.id;

    if (!subscriptionId) {
        return res.status(400).json({ error: 'subscriptionId is required' });
    }

    try {
        console.log(`Updating subscription ${subscriptionId} for user ${userId}`);

        // Find by userId and subscriptionId to ensure ownership
        const updatedSubscription = await Subscription.findOneAndUpdate(
            { userId, razorpay_subscription_id: subscriptionId },
            {
                $set: {
                    ...updateData,
                    status: 'active' // Ensure status remains 'active' as requested
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedSubscription) {
            return res.status(404).json({ error: 'Subscription not found or not owned by user' });
        }

        console.log(`✅ Subscription ${subscriptionId} updated successfully`);
        res.json({
            success: true,
            message: 'Subscription updated successfully',
            subscription: updatedSubscription
        });
    } catch (error) {
        console.error("❌ Update Subscription Error:", error);
        res.status(500).json({ error: 'Failed to update subscription in database' });
    }
});

// 8. Create New Order
paymentRouter.post('/order/create', async (req, res) => {
    const { orderDetails } = req.body;
    const userId = req.user.id;

    try {
        const newOrder = new Order({
            userId,
            ...orderDetails,
            status: 'Processing',
            createdAt: new Date()
        });

        await newOrder.save();
        res.status(201).json({ success: true, order: newOrder });

        // Notify Admin
        notifyAdmin('new_order', {
            id: newOrder._id,
            orderId: newOrder.orderId,
            amount: newOrder.totalAmount,
            customer: newOrder.billingInfo.fullName
        });
    } catch (error) {
        console.error("❌ Create Order Error:", error);
        res.status(500).json({ error: 'Failed to save order to database' });
    }
});

// 9. Get User Orders
paymentRouter.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("❌ Get Orders Error:", error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// 10. Cancel Order (7-day Logic + Refund)
paymentRouter.patch('/order/cancel', async (req, res) => {
    const { orderId } = req.body;
    const userId = req.user.id;

    try {
        const order = await Order.findOne({ userId, orderId });

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status === 'Cancelled') {
            return res.status(400).json({ error: 'Order is already cancelled' });
        }

        // 7-day check
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 7) {
            return res.status(400).json({ error: 'Order cannot be cancelled after 7 days' });
        }

        // Trigger refund for online payments
        if (order.paymentMethod === 'online' && order.razorpayOrderId) {
            try {
                // Fetch payments for this order
                const payments = await razorpay.orders.fetchPayments(order.razorpayOrderId);
                const successfulPayment = payments.items.find(p => p.status === 'captured');

                if (successfulPayment) {
                    const refund = await razorpay.payments.refund(successfulPayment.id, {
                        amount: order.total * 100, // Amount in paise
                        notes: { reason: 'User cancelled order within 7 days' }
                    });

                    order.refundId = refund.id;
                    order.refundStatus = 'Completed'; // Update refund status to Completed
                    console.log(`✅ Refund initiated for order ${orderId}: ${refund.id}`);

                    // Log Refund Transaction
                    const refundTransaction = new Transaction({
                        userId: userId,
                        orderId: order.orderId,
                        transactionId: `txn_ref_${Date.now()}`,
                        paymentId: refund.id,
                        amount: order.total,
                        type: 'refund',
                        status: 'success',
                        method: 'online',
                        description: `Refund for order #${order.orderId}`,
                        metadata: { razorpayRefundId: refund.id }
                    });
                    await refundTransaction.save();
                }
            } catch (refundError) {
                console.error("⚠️ Refund Processing Failed:", refundError);
                // Log Failed Refund Transaction
                const failedTransaction = new Transaction({
                    userId: userId,
                    orderId: order.orderId,
                    transactionId: `txn_fail_${Date.now()}`,
                    amount: order.total,
                    type: 'refund',
                    status: 'failed',
                    method: 'online',
                    description: `Refund failed for order #${order.orderId}`,
                    metadata: { error: refundError.message }
                });
                await failedTransaction.save();
                order.refundStatus = 'Failed'; // Update refund status to Failed
            }
        } else {
            order.refundStatus = 'None'; // No refund needed for COD
        }

        order.status = 'Cancelled';
        order.tracking.currentStage = -1; // Indicate cancellation in tracking
        order.tracking.stages.push('Cancelled'); // Add Cancelled stage

        await order.save();

        // Notify Admin
        notifyAdmin('order_cancelled', {
            type: 'warning',
            title: 'Order Cancelled',
            message: `Order #${order.orderId} was cancelled by the user.`,
            orderId: order.orderId,
            amount: order.total,
            refundStatus: order.refundStatus,
            timestamp: new Date()
        });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error("❌ Cancel Order Error:", error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});

// Mount routes
app.use('/api/payment', authenticateToken, isUser, paymentRouter);

// 7. Get User Profile
app.get('/api/user/profile', authenticateToken, isUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// 9. Add Product Review
app.post('/api/products/:productId/reviews', async (req, res) => {
    const { productId } = req.params;
    const { userName, rating, comment } = req.body;

    if (!userName || !rating || !comment) {
        return res.status(400).json({ error: 'Name, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    try {
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const newReview = {
            userName,
            rating: Number(rating),
            comment,
            createdAt: new Date()
        };

        product.reviewItems.push(newReview);

        // Recalculate average rating and review count
        const totalRating = product.reviewItems.reduce((acc, item) => acc + item.rating, 0);
        product.reviews = product.reviewItems.length;
        product.rating = (totalRating / product.reviews).toFixed(1);

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            product: {
                rating: product.rating,
                reviews: product.reviews,
                reviewItems: product.reviewItems
            }
        });

    } catch (error) {
        console.error("Add Review Error:", error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

// 10. Update User Profile
app.patch('/api/user/profile', authenticateToken, isUser, async (req, res) => {
    const { fullName, email, phone, address } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (fullName) user.fullName = fullName;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (address) user.address = address;

        await user.save();

        const updatedUser = user.toObject();
        delete updatedUser.passwordHash;

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email or phone already in use' });
        }
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'HealthKart Backend is running (MongoDB)' });
});

// Public Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        console.log(`✅ GET /api/products - Returning ${products.length} products`);
        res.json(products);
    } catch (error) {
        console.error('❌ GET /api/products - Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Public Order Tracking
app.post('/api/track-order', async (req, res) => {
    const { orderId, contact } = req.body;

    if (!orderId || !contact) {
        return res.status(400).json({ error: 'Order ID and Contact (Email or Phone) are required' });
    }

    try {
        // Find order by ID and match contact
        const order = await Order.findOne({
            orderId: orderId,
            $or: [
                { 'billingInfo.email': contact },
                { 'billingInfo.phone': contact }
            ]
        });

        if (!order) {
            return res.status(404).json({ error: 'Order not found or details do not match' });
        }

        res.json({
            orderId: order.orderId,
            status: order.status,
            tracking: order.tracking,
            orderDate: order.orderDate,
            items: order.items,
            total: order.total
        });
    } catch (error) {
        console.error("Track Order Error:", error);
        res.status(500).json({ error: 'Failed to track order' });
    }
});

// --- Admin Routes ---
const adminRouter = express.Router();
adminRouter.use(authenticateToken, isAdmin);

// 1. Dashboard Stats
adminRouter.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

        // Sum total revenue from orders that aren't cancelled
        const revenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10);

        res.json({
            totalUsers,
            totalOrders,
            totalRevenue,
            activeSubscriptions,
            recentOrders
        });
    } catch (error) {
        console.error("Admin Stats Error:", error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// 1.5 Analytics Data
adminRouter.get('/analytics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

        const revenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Daily Revenue & Orders (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyStats = await Order.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$total" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Monthly User Growth (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, role: 'user' } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            summary: {
                totalUsers,
                totalOrders,
                totalRevenue,
                activeSubscriptions
            },
            charts: {
                dailyStats,
                userGrowth
            }
        });
    } catch (error) {
        console.error("Admin Analytics Error:", error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
});

// 2. Products Management
adminRouter.get('/products', async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const query = {};

        if (category && category !== 'All') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalProducts: count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

adminRouter.post('/products', async (req, res) => {
    try {
        console.log('📦 Admin creating new product:', req.body.name);
        const product = new Product(req.body);
        await product.save();
        console.log(`✅ Product created successfully: ${product.name} (ID: ${product._id})`);
        console.log(`   - Category: ${product.category}, Brand: ${product.brand}, Price: ₹${product.price}`);
        console.log(`   - Stock: ${product.stock}, Active: ${product.isActive !== false}`);
        res.status(201).json({ success: true, product });
    } catch (error) {
        console.error('❌ Failed to create product:', error.message);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

adminRouter.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
});

adminRouter.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// 3. Orders Management
adminRouter.get('/orders', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { orderId: { $regex: search, $options: 'i' } },
                { 'billingInfo.email': { $regex: search, $options: 'i' } },
                { 'billingInfo.fullName': { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalOrders: count
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

adminRouter.get('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order details' });
    }
});

adminRouter.patch('/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = status;

        // Auto-update tracking stage based on status
        const stageMap = {
            'Processing': 0, // Order Placed / Processing
            'Packed': 1,     // Packed
            'Shipped': 2,    // Shipped
            'Delivered': 3   // Delivered
        };

        if (stageMap.hasOwnProperty(status)) {
            order.tracking.currentStage = stageMap[status];
        }

        await order.save();
        res.json({ success: true, order });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// 4. User Management
adminRouter.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

adminRouter.patch('/users/:id/role', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

adminRouter.patch('/users/:id/block', async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user block status' });
    }
});

adminRouter.get('/analytics/top-selling', async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.id",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);
        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top selling products' });
    }
});

// 5. Advanced Analytics Endpoints

// 5.1 Sales Forecast (Linear Regression)
adminRouter.get('/analytics/forecast', async (req, res) => {
    try {
        // Get last 30 days daily revenue
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill missing days with 0
        const dataPoints = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = dailyRevenue.find(r => r._id === dateStr);
            dataPoints.push({
                x: 29 - i, // 0 to 29
                y: found ? found.revenue : 0,
                date: dateStr
            });
        }

        // Linear Regression Calculation
        const n = dataPoints.length;
        const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
        const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
        const sumXY = dataPoints.reduce((acc, p) => acc + (p.x * p.y), 0);
        const sumXX = dataPoints.reduce((acc, p) => acc + (p.x * p.x), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Predict next 7 days
        const forecast = [];
        for (let i = 1; i <= 7; i++) {
            const nextDate = new Date();
            nextDate.setDate(today.getDate() + i);
            const predictedRevenue = Math.max(0, slope * (29 + i) + intercept); // x = 30 to 36
            forecast.push({
                date: nextDate.toISOString().split('T')[0],
                revenue: Math.round(predictedRevenue)
            });
        }

        res.json({ history: dataPoints, forecast });
    } catch (error) {
        console.error("Forecast Error:", error);
        res.status(500).json({ error: 'Failed to generate forecast' });
    }
});

// 5.2 Geographic Heatmap
adminRouter.get('/analytics/heatmap', async (req, res) => {
    try {
        const heatmapData = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: "$billingInfo.state", // Assuming state is populated
                    value: { $sum: "$total" }, // Total revenue per state
                    count: { $sum: 1 }
                }
            },
            { $sort: { value: -1 } }
        ]);
        // Filter out null/empty states if any
        res.json(heatmapData.filter(d => d._id));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch heatmap data' });
    }
});

// 5.3 Customer Retention & LTV
adminRouter.get('/analytics/retention', async (req, res) => {
    try {
        const totalCustomers = await User.countDocuments({ role: 'user' });

        // Find customers with > 1 order
        const repeatCustomers = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: "$userId", count: { $sum: 1 }, totalSpent: { $sum: "$total" } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        const repeatCount = repeatCustomers.length;
        const retentionRate = totalCustomers > 0 ? (repeatCount / totalCustomers) * 100 : 0;

        // Calculate LTV (Average Revenue Per User)
        const totalRevenueResult = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalRevenue = totalRevenueResult.length ? totalRevenueResult[0].total : 0;
        const ltv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        res.json({
            retentionRate: retentionRate.toFixed(1),
            repeatCustomers: repeatCount,
            ltv: Math.round(ltv)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch retention stats' });
    }
});

// 5.4 Activity Feed
adminRouter.get('/analytics/activity-feed', async (req, res) => {
    try {
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).lean();

        const feed = [
            ...recentOrders.map(o => ({
                id: o._id,
                type: 'order',
                message: `New order #${o.orderId} - ₹${o.total}`,
                timestamp: o.createdAt,
                user: o.billingInfo.fullName
            })),
            ...recentUsers.map(u => ({
                id: u._id,
                type: 'user',
                message: `New user registered: ${u.fullName}`,
                timestamp: u.createdAt,
                user: u.fullName
            }))
        ];

        // Sort combined feed
        feed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(feed.slice(0, 20)); // Return top 20 events
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity feed' });
    }
});

// 5.5 Restock Recommendations
adminRouter.get('/recommendations', async (req, res) => {
    try {
        // Find products with stock < 10
        const lowStockProducts = await Product.find({ stock: { $lt: 10 }, isActive: true })
            .select('name stock price image category')
            .limit(10);

        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
});

// 5. Subscription Management
adminRouter.get('/subscriptions', async (req, res) => {
    try {
        const subs = await Subscription.find().sort({ createdAt: -1 });
        res.json(subs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
});

app.use('/api/admin', adminRouter);

// Start Server
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Error handling for port in use
httpServer.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`❌ Error: Port ${PORT} is already in use.`);
        console.error('Please kill the process using this port and try again.');
        process.exit(1);
    } else {
        console.error('❌ Server error:', e);
    }
});

// Global Unhandled Rejection/Exception Handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception thrown:', err);
    // In a production app, you might want to restart gracefully
    // process.exit(1);
});
