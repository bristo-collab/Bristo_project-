import React from 'react';
import '../styles/SubscriptionPlans.css';
import { useCart } from '../context/CartContext';
import { useSubscriptions } from '../context/SubscriptionContext';

const SubscriptionPlans = () => {
    const { addToCart } = useCart();
    const { addSubscription } = useSubscriptions();
    const [selectedFrequencies, setSelectedFrequencies] = React.useState({});

    const frequencies = ['15 Days', 'Monthly', '2 Months', '3 Months'];

    const handleFrequencyChange = (planId, freq) => {
        setSelectedFrequencies(prev => ({ ...prev, [planId]: freq }));
    };

    const plans = [
        {
            id: 'sub_monthly',
            title: 'Whey Monthly Pack',
            price: 2999,
            displayPrice: '₹2,999',
            originalPrice: '₹3,800',
            save: '21%',
            frequency: 'Every Month',
            features: ['100% Whey Protein (2kg)', 'Free HK Shaker', 'Free Delivery'],
            popular: false,
            gradient: 'blue',
            bestFor: 'Individual Athletes',
            isSubscription: true,
            image: 'https://img5.hkrtconn.com/22684/prd_2268394-MuscleBlaze-Biozyme-Performance-Whey-2-kg-Rich-Milk-Chocolate_c_l.jpg'
        },
        {
            id: 'sub_essentials',
            title: 'Fitness Essentials',
            price: 4499,
            displayPrice: '₹4,499',
            originalPrice: '₹6,000',
            save: '25%',
            frequency: 'Every 2 Months',
            features: ['Whey Protein + Creatine', 'Multivitamins Included', 'Free Diet Consultation', 'Priority Support'],
            popular: true,
            gradient: 'gold',
            bestFor: 'Serious Bodybuilders',
            isSubscription: true,
            image: 'https://img2.hkrtconn.com/18997/prd_1899661-MuscleBlaze-Super-Gainer-XXL-3-kg-6.6-lb-Chocolate_c_l.jpg'
        },
        {
            id: 'sub_fatloss',
            title: 'Fat Loss Starter',
            price: 1999,
            displayPrice: '₹1,999',
            originalPrice: '₹2,500',
            save: '20%',
            frequency: 'Every Month',
            features: ['Fat Burner (60 caps)', 'L-Carnitine', 'Free Workout Guide'],
            popular: false,
            gradient: 'green',
            bestFor: 'Weight Management',
            isSubscription: true,
            image: 'https://img3.hkrtconn.com/16213/prd_1621242-MuscleBlaze-MB-Burner-PRO-60-capsules-Unflavoured_c_l.jpg'
        }
    ];

    const benefits = [
        { icon: '💰', title: 'Flat 10% Extra Off', desc: 'Save more on every recurring order automatically.' },
        { icon: '🚚', title: 'Always Free Shipping', desc: 'No minimum order value required for subscribers.' },
        { icon: '📞', title: 'Priority Support', desc: '24/7 dedicated helpline for all your fitness queries.' },
        { icon: '🍎', title: 'Nutritional Coaching', desc: 'Monthly consultation with certified HK nutritionists.' }
    ];

    const steps = [
        { num: '01', title: 'Choose Your Plan', desc: 'Select the supplement stack that fits your fitness goal.' },
        { num: '02', title: 'Set Frequency', desc: 'Tell us how often you want your supplements delivered.' },
        { num: '03', title: 'Get Gains', desc: 'Focus on your workout while we handle your nutrition supply.' }
    ];

    const comparisonData = [
        { feature: 'Auto-Delivery', basic: 'No', sub: 'Yes' },
        { feature: 'Extra Discount', basic: '0%', sub: '10%' },
        { feature: 'Shipping Fee', basic: '₹40', sub: '₹0' },
        { feature: 'Diet Plan', basic: 'Generic', sub: 'Personalized' },
        { feature: 'Cancel Anytime', basic: '-', sub: 'Yes' }
    ];

    const faqs = [
        { q: 'Can I cancel my subscription anytime?', a: 'Yes, you can pause or cancel your subscription at any time through your account dashboard with zero hidden charges.' },
        { q: 'How do I pay for future orders?', a: 'We support automated payments via Credit Cards, UPI, and major Wallets. You will be notified 2 days before every debit.' },
        { q: 'Can I change my supplements later?', a: 'Absolutely! You can swap products in your plan anytime before your next billing cycle starts.' }
    ];

    const handleSubscribe = (plan) => {
        const freq = selectedFrequencies[plan.id] || plan.frequency;

        // Add to Cart for checkout with metadata
        addToCart({
            id: plan.id,
            name: plan.title,
            price: plan.price,
            image: plan.image,
            isSubscription: true,
            frequency: freq,
            status: 'Pending'
        });
    };


    return (
        <section className="subscription-page">
            <div className="container">
                {/* Hero Header */}
                <div className="section-header">
                    <span className="badge-text">HK PRO SUBSCRIPTION</span>
                    <h1 className="section-title">Upgrade Your <span className="highlight">Commitment</span></h1>
                    <p className="section-subtitle">Get elite-level convenience and savings. Join 50,000+ fitness enthusiasts.</p>
                </div>

                {/* Benefits Banner */}
                <div className="benefits-grid">
                    {benefits.map((benefit, idx) => (
                        <div key={idx} className="benefit-card">
                            <span className="benefit-icon">{benefit.icon}</span>
                            <h4>{benefit.title}</h4>
                            <p>{benefit.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Main Plans */}
                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`plan-card ${plan.popular ? 'popular-plan' : ''} gradient-${plan.gradient}`}>
                            {plan.popular && <div className="popular-badge">Most Popular</div>}
                            <div className="plan-label">{plan.bestFor}</div>
                            <h3 className="plan-title">{plan.title}</h3>

                            <div className="plan-price">
                                <span className="current-price">{plan.displayPrice}</span>
                                <span className="original-price">{plan.originalPrice}</span>
                            </div>

                            <div className="plan-savings">
                                Save <span className="save-tag">{plan.save}</span> • Recurring Delivery
                            </div>

                            <div className="frequency-selector">
                                <label>Choose Cadence:</label>
                                <div className="freq-pills">
                                    {frequencies.map(freq => (
                                        <button
                                            key={freq}
                                            className={`freq-pill ${(selectedFrequencies[plan.id] || plan.frequency) === freq ? 'active' : ''}`}
                                            onClick={() => handleFrequencyChange(plan.id, freq)}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <svg className="check-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className="subscribe-btn"
                                onClick={() => handleSubscribe(plan)}
                            >
                                Get Started Now
                            </button>
                        </div>
                    ))}
                </div>

                {/* How It Works */}
                <div className="how-it-works">
                    <h2 className="sub-section-title">How It Works</h2>
                    <div className="steps-grid">
                        {steps.map((step, idx) => (
                            <div key={idx} className="step-card">
                                <div className="step-num">{step.num}</div>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparison Table */}
                <div className="comparison-section">
                    <h2 className="sub-section-title">Standard vs HK Pro</h2>
                    <div className="table-wrapper">
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>Feature</th>
                                    <th>Standard Purchase</th>
                                    <th className="highlight-col">HK Pro Subscription</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{row.feature}</td>
                                        <td>{row.basic}</td>
                                        <td className="highlight-col">{row.sub}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="faq-section">
                    <h2 className="sub-section-title">Frequently Asked Questions</h2>
                    <div className="faq-grid">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="faq-item">
                                <h4>{faq.q}</h4>
                                <p>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

    );
};

export default SubscriptionPlans;
