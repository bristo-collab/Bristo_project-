/**
 * Mock Pin Code Service with Kerala Regional Logic
 * Simulates checking serviceability, delivery dates, and region-specific restrictions.
 */

const KERALA_NORTH_PREFIX = '67';
const KERALA_SOUTH_PREFIXES = ['68', '69'];

// White-listed hubs in Southern/Central Kerala
const SOUTHERN_WHITE_LIST = [
    '682', // Ernakulam / Kochi
    '695', // Thiruvananthapuram
    '680', // Thrissur
    '691', // Kollam
];

const DISTRICT_MAPPING = {
    '670': 'Kannur',
    '671': 'Kasaragod',
    '673': 'Kozhikode/Wayanad',
    '676': 'Malappuram',
    '678': 'Palakkad',
    '679': 'Malappuram/Palakkad',
    '680': 'Thrissur',
    '682': 'Ernakulam',
    '685': 'Idukki',
    '686': 'Kottayam',
    '688': 'Alappuzha',
    '689': 'Pathanamthitta',
    '691': 'Kollam',
    '695': 'Thiruvananthapuram',
};

/**
 * Quick validation to check if a pincode is a Kerala pincode
 * @param {string} pincode - 6 digit pincode
 * @returns {boolean} - true if Kerala pincode (67xxxx, 68xxxx, 69xxxx)
 */
export const isKeralaPincode = (pincode) => {
    if (!/^\d{6}$/.test(pincode)) {
        return false;
    }
    const prefix2 = pincode.substring(0, 2);
    return prefix2 === '67' || prefix2 === '68' || prefix2 === '69';
};

export const checkPincodeService = (pincode) => {
    return new Promise((resolve) => {
        // Simulate API delay
        setTimeout(() => {
            // Basic validation
            if (!/^\d{6}$/.test(pincode)) {
                resolve({
                    success: false,
                    error: 'Invalid format. Please enter a valid 6-digit pin code.'
                });
                return;
            }

            const prefix2 = pincode.substring(0, 2);
            const prefix3 = pincode.substring(0, 3);
            const district = DISTRICT_MAPPING[prefix3] || 'Unknown District';

            // 1. Check if it's North Kerala
            if (prefix2 === KERALA_NORTH_PREFIX) {
                const deliveryDate = new Date();
                deliveryDate.setDate(deliveryDate.getDate() + 3);
                const formattedDate = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                resolve({
                    success: true,
                    region: 'North Kerala',
                    district: district,
                    deliveryDate: formattedDate,
                    shipping: 0,
                    cod: true,
                    message: `✅ Full Service Available in ${district} (North Kerala).`
                });
                return;
            }

            // 2. Check if it's Southern/Central Kerala
            if (KERALA_SOUTH_PREFIXES.includes(prefix2)) {
                if (SOUTHERN_WHITE_LIST.includes(prefix3)) {
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + 4);
                    const formattedDate = deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                    resolve({
                        success: true,
                        region: 'South/Central Kerala',
                        district: district,
                        deliveryDate: formattedDate,
                        shipping: 40,
                        cod: true,
                        message: `✅ Essential Hub Service Available in ${district}.`
                    });
                } else {
                    resolve({
                        success: false,
                        region: 'South/Central Kerala',
                        district: district,
                        error: `📍 Limited Serviceability: Currently, we only deliver to selected hubs in ${district}. We're expanding soon!`
                    });
                }
                return;
            }

            // 3. Handle other regions (outside Kerala) - Enhanced error message
            resolve({
                success: false,
                error: '🚫 We currently only deliver to Kerala. Please enter a valid Kerala pincode (67xxxx, 68xxxx, or 69xxxx).'
            });

        }, 800);
    });
};
