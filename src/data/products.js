export const products = [
    { id: 1, name: 'Gold Standard 100% Whey', category: 'Proteins', subCategory: 'Whey Protein', brand: 'Optimum Nutrition', price: 3099, rating: 4.8, reviews: 1240, image: 'gold_whey', tags: ['Best Seller'], stock: true, flavors: ['Double Rich Chocolate', 'Vanilla Ice Cream', 'Strawberry'], weight: '2lb' },
    { id: 2, name: 'MuscleBlaze Biozyme Whey', category: 'Proteins', subCategory: 'Whey Protein', brand: 'MuscleBlaze', price: 2499, rating: 4.7, reviews: 950, image: 'mb_biozyme', tags: ['Trending'], stock: true, flavors: ['Rich Chocolate', 'Cafe Mocha'], weight: '2kg' },
    { id: 3, name: 'GNC Pro Performance', category: 'Proteins', subCategory: 'Whey Protein', brand: 'GNC', price: 2199, rating: 4.5, reviews: 600, image: 'gnc_whey', tags: [], stock: true, flavors: ['Chocolate Fudge', 'Vanilla'], weight: '2lb' },
    { id: 4, name: 'Isopure Low Carb', category: 'Proteins', subCategory: 'Isolate', brand: 'Isopure', price: 5499, rating: 4.9, reviews: 320, image: 'isopure_low_carb', tags: ['Premium'], stock: true, flavors: ['Dutch Chocolate', 'Toasted Coconut'], weight: '3lb' },

    { id: 5, name: 'MuscleBlaze Creatine Monohydrate', category: 'Pre/Post Workout', subCategory: 'Creatine', brand: 'MuscleBlaze', price: 499, rating: 4.6, reviews: 1500, image: 'mb_creatine', tags: ['Best Seller'], stock: true, flavors: ['Unflavored', 'Fruit Punch'], weight: '100g' },
    { id: 6, name: 'ON Micronized Creatine', category: 'Pre/Post Workout', subCategory: 'Creatine', brand: 'Optimum Nutrition', price: 899, rating: 4.8, reviews: 800, image: 'on_creatine', tags: [], stock: false, flavors: ['Unflavored'], weight: '250g' },

    { id: 7, name: 'C4 Original Pre Workout', category: 'Pre/Post Workout', subCategory: 'Pre-Workout', brand: 'Cellucor', price: 1999, rating: 4.7, reviews: 2100, image: 'c4_pre', tags: ['Popular'], stock: true, flavors: ['Icy Blue Razz', 'Fruit Punch'], weight: '60 servings' },
    { id: 8, name: 'Psychotic Pre Workout', category: 'Pre/Post Workout', subCategory: 'Pre-Workout', brand: 'Insane Labz', price: 2499, rating: 4.5, reviews: 500, image: 'psychotic_pre', tags: ['Strong'], stock: true, flavors: ['Grape', 'Apple'], weight: '35 servings' },

    { id: 9, name: 'HK Vitals Multivitamin', category: 'Vitamins', subCategory: 'Multivitamins', brand: 'HealthKart', price: 399, rating: 4.4, reviews: 3000, image: 'hkv_multi', tags: ['Essential'], stock: true, flavors: ['Unflavored'], weight: '60 tabs' },
    { id: 10, name: 'Fish Oil 1000mg', category: 'Vitamins', subCategory: 'Omega 3', brand: 'HealthKart', price: 599, rating: 4.6, reviews: 2500, image: 'fish_oil', tags: [], stock: true, flavors: ['Unflavored'], weight: '60 caps' },

    { id: 11, name: 'Peanut Butter Crunchy', category: 'Fit Foods', subCategory: 'Peanut Butter', brand: 'MyFitness', price: 649, rating: 4.8, reviews: 4000, image: 'peanut_butter', tags: ['Tasty'], stock: true, flavors: ['Chocolate', 'Original'], weight: '1kg' },
    { id: 12, name: 'Protein Bars (Pack of 6)', category: 'Proteins', subCategory: 'Protein Bars', brand: 'RiteBite', price: 420, rating: 4.3, reviews: 1000, image: 'protein_bars', tags: [], stock: true, flavors: ['Choco Almond', 'Yogurt Berry'], weight: 'Pack of 6' },

    { id: 13, name: 'Mass Gainer XXL', category: 'Gainers', subCategory: 'Mass Gainers', brand: 'MuscleBlaze', price: 3499, rating: 4.5, reviews: 1100, image: 'mb_gainer', tags: [], stock: true, flavors: ['Chocolate'], weight: '3kg' },
    { id: 14, name: 'Serious Mass', category: 'Gainers', subCategory: 'Mass Gainers', brand: 'Optimum Nutrition', price: 4299, rating: 4.7, reviews: 900, image: 'on_gainer', tags: ['High Calorie'], stock: true, flavors: ['Chocolate', 'Vanilla'], weight: '6lb' },

    { id: 15, name: 'BCAA 6000', category: 'Pre/Post Workout', subCategory: 'BCAAs', brand: 'MuscleBlaze', price: 1299, rating: 4.4, reviews: 400, image: 'mb_bcaa', tags: [], stock: true, flavors: ['Watermelon', 'Lemon'], weight: '250g' },

    { id: 16, name: 'Yoga Mat Premium', category: 'Accessories', subCategory: 'Yoga Mats', brand: 'HealthKart', price: 899, rating: 4.5, reviews: 200, image: 'yoga_mat', tags: [], stock: true, flavors: [], weight: 'N/A' },
    { id: 17, name: 'Resistance Bands Set', category: 'Accessories', subCategory: 'Belts', brand: 'Boldfit', price: 599, rating: 4.2, reviews: 600, image: 'resistance_bands', tags: [], stock: true, flavors: [], weight: 'N/A' },

    { id: 18, name: 'Apple Cider Vinegar', category: 'Ayurveda', subCategory: 'Immunity Boosters', brand: 'HealthKart', price: 349, rating: 4.3, reviews: 800, image: 'acv', tags: [], stock: true, flavors: ['Apple'], weight: '500ml' },
    { id: 19, name: 'Ashwagandha 500mg', category: 'Ayurveda', subCategory: 'Ashwagandha', brand: 'Himalaya', price: 299, rating: 4.6, reviews: 5000, image: 'ashwa', tags: ['Ayurveda'], stock: true, flavors: ['Unflavored'], weight: '60 tabs' },

    { id: 20, name: 'Isopure Zero Carb', category: 'Proteins', subCategory: 'Isolate', brand: 'Isopure', price: 6999, rating: 4.9, reviews: 120, image: 'isopure_zero', tags: ['Zero Carb'], stock: false, flavors: ['Alpine Punch'], weight: '3lb' },
    { id: 21, name: 'BigMuscles Raw Whey', category: 'Proteins', subCategory: 'Whey Protein', brand: 'BigMuscles', price: 1899, rating: 4.3, reviews: 850, image: 'bm_raw_whey', tags: [], stock: true, flavors: ['Chocolate', 'Vanilla'], weight: '1kg' },
    { id: 22, name: 'MyProtein Impact Whey', category: 'Proteins', subCategory: 'Whey Protein', brand: 'MyProtein', price: 2799, rating: 4.6, reviews: 1300, image: 'myprotein_impact', tags: ['Imported'], stock: true, flavors: ['Cookies & Cream', 'Salted Caramel'], weight: '2.5kg' },

    { id: 23, name: 'Fast&Up Creatine', category: 'Pre/Post Workout', subCategory: 'Creatine', brand: 'Fast&Up', price: 799, rating: 4.5, reviews: 900, image: 'creatine3', tags: [], stock: true, flavors: ['Unflavored'], weight: '250g' },
    { id: 24, name: 'HealthKart Creatine', category: 'Pre/Post Workout', subCategory: 'Creatine', brand: 'HealthKart', price: 599, rating: 4.4, reviews: 700, image: 'creatine4', tags: [], stock: true, flavors: ['Orange'], weight: '150g' },

    { id: 25, name: 'MuscleTech NitroTech', category: 'Proteins', subCategory: 'Whey Protein', brand: 'MuscleTech', price: 5999, rating: 4.8, reviews: 1100, image: 'protein7', tags: ['Premium'], stock: true, flavors: ['Milk Chocolate', 'Vanilla'], weight: '4lb' },
    { id: 26, name: 'Dymatize ISO100', category: 'Proteins', subCategory: 'Isolate', brand: 'Dymatize', price: 6899, rating: 4.9, reviews: 1400, image: 'protein8', tags: ['Isolate'], stock: true, flavors: ['Fudge Brownie', 'Gourmet Vanilla'], weight: '5lb' },

    { id: 27, name: 'Pre JYM Pre Workout', category: 'Pre/Post Workout', subCategory: 'Pre-Workout', brand: 'JYM', price: 2499, rating: 4.6, reviews: 600, image: 'pre3', tags: [], stock: true, flavors: ['Fruit Punch'], weight: '30 servings' },
    { id: 28, name: 'MuscleBlaze WrathX', category: 'Pre/Post Workout', subCategory: 'Pre-Workout', brand: 'MuscleBlaze', price: 1799, rating: 4.4, reviews: 1000, image: 'pre4', tags: [], stock: true, flavors: ['Green Apple'], weight: '50 servings' },

    { id: 29, name: 'Wellcore Omega 3', category: 'Vitamins', subCategory: 'Omega 3', brand: 'Wellcore', price: 799, rating: 4.5, reviews: 950, image: 'vit3', tags: [], stock: true, flavors: ['Unflavored'], weight: '120 caps' },
    { id: 30, name: 'TrueBasics Vitamin D3', category: 'Vitamins', subCategory: 'Vitamin D', brand: 'TrueBasics', price: 499, rating: 4.4, reviews: 1500, image: 'vit4', tags: [], stock: true, flavors: ['Unflavored'], weight: '60 tabs' },

    { id: 31, name: 'Yoga Block Cork', category: 'Accessories', subCategory: 'Yoga Mats', brand: 'Boldfit', price: 349, rating: 4.2, reviews: 400, image: 'block', tags: [], stock: true, flavors: [], weight: 'N/A' },
    { id: 32, name: 'Gym Gloves Pro', category: 'Accessories', subCategory: 'Gloves', brand: 'HRX', price: 799, rating: 4.5, reviews: 700, image: 'gloves', tags: [], stock: true, flavors: [], weight: 'N/A' },

    { id: 33, name: 'Oats Protein Cookies', category: 'Fit Foods', subCategory: 'Healthy Snacks', brand: 'YogaBar', price: 299, rating: 4.3, reviews: 1200, image: 'food3', tags: [], stock: true, flavors: ['Choco Chip'], weight: '200g' },
    { id: 34, name: 'Almond Butter Smooth', category: 'Fit Foods', subCategory: 'Peanut Butter', brand: 'Pintola', price: 799, rating: 4.7, reviews: 2500, image: 'food4', tags: ['Healthy'], stock: true, flavors: ['Original'], weight: '1kg' },

    { id: 35, name: 'Pro Mass Gainer', category: 'Gainers', subCategory: 'Mass Gainers', brand: 'HealthKart', price: 2899, rating: 4.3, reviews: 600, image: 'gainer3', tags: [], stock: true, flavors: ['Chocolate'], weight: '3kg' },
    { id: 36, name: 'Serious Mass Banana', category: 'Gainers', subCategory: 'Mass Gainers', brand: 'Optimum Nutrition', price: 4399, rating: 4.6, reviews: 850, image: 'gainer4', tags: [], stock: true, flavors: ['Banana'], weight: '6lb' },

    { id: 37, name: 'Xtend BCAA', category: 'Pre/Post Workout', subCategory: 'BCAAs', brand: 'Scivation', price: 2199, rating: 4.7, reviews: 750, image: 'bcaa2', tags: [], stock: true, flavors: ['Mango'], weight: '400g' },
    { id: 38, name: 'Amino Energy', category: 'Pre/Post Workout', subCategory: 'BCAAs', brand: 'Optimum Nutrition', price: 1899, rating: 4.5, reviews: 900, image: 'amino1', tags: [], stock: true, flavors: ['Orange'], weight: '270g' },

    { id: 39, name: 'Herbal Green Tea', category: 'Ayurveda', subCategory: 'Herbal Teas', brand: 'Organic India', price: 249, rating: 4.4, reviews: 3000, image: 'tea1', tags: [], stock: true, flavors: ['Lemon'], weight: '100g' },
    { id: 40, name: 'Triphala Tablets', category: 'Ayurveda', subCategory: 'Immunity Boosters', brand: 'Patanjali', price: 199, rating: 4.2, reviews: 5000, image: 'tri', tags: [], stock: true, flavors: ['Unflavored'], weight: '60 tabs' },

    { id: 41, name: 'Shaker Bottle Pro', category: 'Accessories', subCategory: 'Shakers', brand: 'Boldfit', price: 299, rating: 4.3, reviews: 1200, image: 'shaker', tags: [], stock: true, flavors: [], weight: 'N/A' },
    { id: 42, name: 'Gym Bag Large', category: 'Accessories', subCategory: 'Gym Bags', brand: 'HRX', price: 1299, rating: 4.6, reviews: 400, image: 'bag', tags: [], stock: true, flavors: [], weight: 'N/A' },

    { id: 43, name: 'Plant Protein Blend', category: 'Proteins', subCategory: 'Plant Protein', brand: 'Oziva', price: 2299, rating: 4.4, reviews: 650, image: 'protein9', tags: ['Vegan'], stock: true, flavors: ['Chocolate'], weight: '1kg' },
    { id: 44, name: 'Casein Protein Night', category: 'Proteins', subCategory: 'Casein', brand: 'MyProtein', price: 3199, rating: 4.6, reviews: 550, image: 'protein10', tags: [], stock: true, flavors: ['Vanilla'], weight: '2kg' },

    { id: 45, name: 'L-Carnitine Liquid', category: 'Fat Loss', subCategory: 'L-Carnitine', brand: 'MuscleBlaze', price: 899, rating: 4.3, reviews: 700, image: 'fat1', tags: [], stock: true, flavors: ['Orange'], weight: '500ml' },
    { id: 46, name: 'Hydroxycut Hardcore', category: 'Fat Loss', subCategory: 'Fat Burners', brand: 'MuscleTech', price: 2999, rating: 4.5, reviews: 350, image: 'fat2', tags: [], stock: true, flavors: ['Capsule'], weight: '100 caps' },

    { id: 47, name: 'Compression T-Shirt', category: 'Accessories', subCategory: 'Gym Bags', brand: 'HRX', price: 999, rating: 4.6, reviews: 1200, image: 'apparel1', tags: [], stock: true, flavors: [], weight: 'N/A' },
    { id: 48, name: 'Training Shorts', category: 'Accessories', subCategory: 'Gym Bags', brand: 'Puma', price: 1499, rating: 4.7, reviews: 900, image: 'apparel2', tags: [], stock: true, flavors: [], weight: 'N/A' },

    { id: 49, name: 'Foam Roller Pro', category: 'Accessories', subCategory: 'Belts', brand: 'Boldfit', price: 699, rating: 4.5, reviews: 500, image: 'roller', tags: [], stock: true, flavors: [], weight: 'N/A' },
    { id: 50, name: 'Whey Isolate Clear', category: 'Proteins', subCategory: 'Isolate', brand: 'Fast&Up', price: 3799, rating: 4.6, reviews: 420, image: 'protein11', tags: ['Clear Whey'], stock: true, flavors: ['Lemon Ice Tea'], weight: '1kg' },

];
