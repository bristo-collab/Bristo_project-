// Centralized Product Image Mapping
// This file handles all image imports and provides a robust lookup utility

// Brand Logos
import mb_logo from '../assets/images/muscleblaze logo.png';
import gnc_logo from '../assets/images/GNC logo.png';
import on_logo from '../assets/images/on logo.png';
import hk_logo from '../assets/images/healthkart logo.png';

// Product Images
import mb_biozyme from '../assets/images/mb_biozyme.jpg';
import isopure_low_carb from '../assets/images/isopure_low_carb.jpg';
import protein1 from '../assets/images/protein1.jpg';
import ashwagandha from '../assets/images/Ashwagandha 500mg.jpg';
import bcaa from '../assets/images/BCAA 6000.jpg';
import citrulline from '../assets/images/L-Citrulline.webp';
import protein_bars from '../assets/images/Protein Bars (Pack of 6).jpg';
import yoga_mat from '../assets/images/Yoga Mat Premium.jpg';

// Mapping of image keys to imported assets
const imageMap = {
    'mb_biozyme': mb_biozyme,
    'isopure_low_carb': isopure_low_carb,
    'protein1': protein1,
    'ashwagandha': ashwagandha,
    'bcaa': bcaa,
    'citrulline': citrulline,
    'protein_bars': protein_bars,
    'yoga_mat': yoga_mat,
    'mb_logo': mb_logo,
    'gnc_logo': gnc_logo,
    'on_logo': on_logo,
    'hk_logo': hk_logo,
    // Add more local imports here
};

// Fallback high-quality placeholder system
const getPlaceholderUrl = (key, name) => {
    const text = encodeURIComponent(name || key || 'Product');
    return `https://placehold.co/600x600/111827/ffffff?text=${text}`;
};

/**
 * Retrieves the correct image for a product
 * @param {string} key - The image key from product data
 * @param {string} name - Product name for placeholder text
 * @returns {string} Image source URL or path
 */
export const getProductImage = (key, name = '') => {
    // 1. Check if we have an explicit local asset mapped
    if (key && imageMap[key]) {
        return imageMap[key];
    }

    // 2. Fallback logic based on name or category keywords if key is missing or not mapped
    const lowerName = name.toLowerCase();

    // Explicit Mappings from User Request
    if (lowerName.includes('bcaa 6000')) {
        return bcaa;
    }
    if (lowerName.includes('l-citruline') || lowerName.includes('l-citrulline')) {
        return citrulline;
    }
    if (lowerName.includes('protein bars')) {
        return protein_bars;
    }
    if (lowerName.includes('ashwagandha') || lowerName.includes('ashagandha')) {
        return ashwagandha;
    }
    if (lowerName.includes('yoga mat')) {
        return yoga_mat;
    }

    // Brand and Category fallbacks
    if (lowerName.includes('whey') || lowerName.includes('protein')) {
        return protein1;
    }
    if (lowerName.includes('muscleblaze')) {
        return mb_biozyme;
    }
    if (lowerName.includes('isopure')) {
        return isopure_low_carb;
    }

    // 3. Return a dynamic placeholder if no local asset fits
    return getPlaceholderUrl(key, name);
};

// Common UI Assets
export const IMAGES = {
    DEFAULT_FALLBACK: 'https://placehold.co/600x600/111827/ffffff?text=HealthKart',
    LOGO: hk_logo,
};
