import axios from 'axios';

/**
 * Admin Profile Update Test Script
 * This script logs in, gets the cookie, and then updates the profile.
 */
const testProfileUpdate = async () => {
    const baseURL = 'http://localhost:5000/api/v1/admin/auth';
    const credentials = {
        email: 'digitalmongers72@gmail.com',
        password: 'Digital1234#'
    };

    console.log('--- Step 1: Logging in ---');
    try {
        const loginRes = await axios.post(`${baseURL}/login`, credentials);
        console.log('✅ Login Success!');

        // Get cookies from the response
        const cookies = loginRes.headers['set-cookie'];

        console.log('\n--- Step 2: Updating Profile ---');
        const updateData = {
            name: 'Digital Mongers Global',
            phoneNumber: '9876543210'
        };

        const updateRes = await axios.patch(`${baseURL}/profile`, updateData, {
            headers: {
                Cookie: cookies.join('; ')
            },
            withCredentials: true
        });

        console.log('✅ Profile Update Success!');
        console.log('Updated Admin Data:', JSON.stringify(updateRes.data.data, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

testProfileUpdate();
