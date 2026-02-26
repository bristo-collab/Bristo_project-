import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Hero from '../components/Hero';
import Brands from '../components/Brands';
import Categories from '../components/Categories';
import FeaturedProducts from '../components/FeaturedProducts';
import PromoBanners from '../components/PromoBanners';
import SubscriptionPlans from '../components/SubscriptionPlans';
import FitnessTips from '../components/FitnessTips';
import Reviews from '../components/Reviews';
import Newsletter from '../components/Newsletter';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin-dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    return (

        <>
            <Hero />
            <Categories />
            <FeaturedProducts />
            <PromoBanners />
            <SubscriptionPlans />
            <FitnessTips />
            <Reviews />
            <Brands />
            <Newsletter />
        </>
    );
};

export default Home;
