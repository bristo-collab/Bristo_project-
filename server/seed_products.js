const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

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
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const productsData = [
    { id: 1, name: 'Gold Standard 100% Whey', category: 'Proteins', subCategory: 'Whey Protein', brand: 'Optimum Nutrition', price: 3099, rating: 4.8, reviews: 1240, image: 'gold_whey', tags: ['Best Seller'], stock: 45, flavors: ['Double Rich Chocolate', 'Vanilla Ice Cream', 'Strawberry'], weight: '2lb' },
    { id: 2, name: 'MuscleBlaze Biozyme Whey', category: 'Proteins', subCategory: 'Whey Protein', brand: 'MuscleBlaze', price: 2499, rating: 4.7, reviews: 950, image: 'mb_biozyme', tags: ['Trending'], stock: 25, flavors: ['Rich Chocolate', 'Cafe Mocha'], weight: '2kg' },
    { id: 3, name: 'GNC Pro Performance', category: 'Proteins', subCategory: 'Whey Protein', brand: 'GNC', price: 2199, rating: 4.5, reviews: 600, image: 'gnc_whey', tags: [], stock: 25, flavors: ['Chocolate Fudge', 'Vanilla'], weight: '2lb' },
    { id: 4, name: 'Isopure Low Carb', category: 'Proteins', subCategory: 'Isolate', brand: 'Isopure', price: 5499, rating: 4.9, reviews: 320, image: 'isopure_low_carb', tags: ['Premium'], stock: 25, flavors: ['Dutch Chocolate', 'Toasted Coconut'], weight: '3lb' },
    { id: 5, name: 'MuscleBlaze Creatine Monohydrate', category: 'Pre/Post Workout', subCategory: 'Creatine', brand: 'MuscleBlaze', price: 499, rating: 4.6, reviews: 1500, image: 'mb_creatine', tags: ['Best Seller'], stock: 25, flavors: ['Unflavored', 'Fruit Punch'], weight: '100g' },
    { id: 6, name: 'ON Micronized Creatine', category: 'Pre/Post Workout', subCategory: 'Creatine', brand: 'Optimum Nutrition', price: 899, rating: 4.8, reviews: 800, image: 'on_creatine', tags: [], stock: 0, flavors: ['Unflavored'], weight: '250g' },
    { id: 7, name: 'C4 Original Pre Workout', category: 'Pre/Post Workout', subCategory: 'Pre-Workout', brand: 'Cellucor', price: 1999, rating: 4.7, reviews: 2100, image: 'c4_pre', tags: ['Popular'], stock: 25, flavors: ['Icy Blue Razz', 'Fruit Punch'], weight: '60 servings' },
    { id: 8, name: 'Psychotic Pre Workout', category: 'Pre/Post Workout', subCategory: 'Pre-Workout', brand: 'Insane Labz', price: 2499, rating: 4.5, reviews: 500, image: 'psychotic_pre', tags: ['Strong'], stock: 25, flavors: ['Grape', 'Apple'], weight: '35 servings' },
    { id: 9, name: 'HK Vitals Multivitamin', category: 'Vitamins', subCategory: 'Multivitamins', brand: 'HealthKart', price: 399, rating: 4.4, reviews: 3000, image: 'hkv_multi', tags: ['Essential'], stock: 25, flavors: ['Unflavored'], weight: '60 tabs' },
    { id: 10, name: 'Fish Oil 1000mg', category: 'Vitamins', subCategory: 'Omega 3', brand: 'HealthKart', price: 599, rating: 4.6, reviews: 2500, image: 'fish_oil', tags: [], stock: 25, flavors: ['Unflavored'], weight: '60 caps' },
    { id: 11, name: 'Peanut Butter Crunchy', category: 'Fit Foods', subCategory: 'Peanut Butter', brand: 'MyFitness', price: 649, rating: 4.8, reviews: 4000, image: 'peanut_butter', tags: ['Tasty'], stock: 25, flavors: ['Chocolate', 'Original'], weight: '1kg' },
    { id: 12, name: 'Protein Bars (Pack of 6)', category: 'Proteins', subCategory: 'Protein Bars', brand: 'RiteBite', price: 420, rating: 4.3, reviews: 1000, image: 'protein_bars', tags: [], stock: 25, flavors: ['Choco Almond', 'Yogurt Berry'], weight: 'Pack of 6' },
    { id: 13, name: 'Mass Gainer XXL', category: 'Gainers', subCategory: 'Mass Gainers', brand: 'MuscleBlaze', price: 3499, rating: 4.5, reviews: 1100, image: 'mb_gainer', tags: [], stock: 25, flavors: ['Chocolate'], weight: '3kg' },
    { id: 14, name: 'Serious Mass', category: 'Gainers', subCategory: 'Mass Gainers', brand: 'Optimum Nutrition', price: 4299, rating: 4.7, reviews: 900, image: 'on_gainer', tags: ['High Calorie'], stock: 25, flavors: ['Chocolate', 'Vanilla'], weight: '6lb' },
    { id: 15, name: 'BCAA 6000', category: 'Pre/Post Workout', subCategory: 'BCAAs', brand: 'MuscleBlaze', price: 1299, rating: 4.4, reviews: 400, image: 'mb_bcaa', tags: [], stock: 25, flavors: ['Watermelon', 'Lemon'], weight: '250g' },
    { id: 16, name: 'Yoga Mat Premium', category: 'Accessories', subCategory: 'Yoga Mats', brand: 'HealthKart', price: 899, rating: 4.5, reviews: 200, image: 'yoga_mat', tags: [], stock: 25, flavors: [], weight: 'N/A' },
    { id: 17, name: 'Resistance Bands Set', category: 'Accessories', subCategory: 'Belts', brand: 'Boldfit', price: 599, rating: 4.2, reviews: 600, image: 'resistance_bands', tags: [], stock: 25, flavors: [], weight: 'N/A' },
    { id: 18, name: 'Apple Cider Vinegar', category: 'Ayurveda', subCategory: 'Immunity Boosters', brand: 'HealthKart', price: 349, rating: 4.3, reviews: 800, image: 'acv', tags: [], stock: 25, flavors: ['Apple'], weight: '500ml' },
    { id: 19, name: 'Ashwagandha 500mg', category: 'Ayurveda', subCategory: 'Ashwagandha', brand: 'Himalaya', price: 299, rating: 4.6, reviews: 5000, image: 'ashwa', tags: ['Ayurveda'], stock: 25, flavors: ['Unflavored'], weight: '60 tabs' },
    { id: 20, name: 'Isopure Zero Carb', category: 'Proteins', subCategory: 'Isolate', brand: 'Isopure', price: 6999, rating: 4.9, reviews: 120, image: 'isopure_zero', tags: ['Zero Carb'], stock: 0, flavors: ['Alpine Punch'], weight: '3lb' },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Remove the id field as MongoDB uses _id
        const seedData = productsData.map(({ id, ...rest }) => rest);

        await Product.insertMany(seedData);
        console.log(`Successfully seeded ${seedData.length} products`);

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seed();
