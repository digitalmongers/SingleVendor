import axios from 'axios';

const testCart = async () => {
    const baseURL = 'http://localhost:5000/api/v1';
    const guestId = `guest_${Date.now()}`;

    // Get a valid product ID from database
    let productId = '67a07fc2fcdfefe43eeed542'; // Replace with a real ID after checking DB

    console.log('--- Step 1: Add to Cart as Guest ---');
    try {
        const addRes = await axios.post(`${baseURL}/cart/add`, {
            productId,
            quantity: 2
        }, {
            headers: { 'x-guest-id': guestId }
        });
        console.log('✅ Guest Add Success!');

        console.log('\n--- Step 2: Get Guest Cart ---');
        const getRes = await axios.get(`${baseURL}/cart`, {
            headers: { 'x-guest-id': guestId }
        });
        console.log('Cart Items:', getRes.data.data.items.length);
        console.log('Total Price:', getRes.data.data.totalPrice);

        console.log('\n--- Step 3: Login & Verify Merge ---');
        const loginRes = await axios.post(`${baseURL}/customers/login`, {
            email: 'paras@digitalmongers.com',
            password: 'Pa25@ra#$',
            guestId: guestId // Trigger merge
        });
        console.log('✅ Login Success!');

        const customerToken = loginRes.headers['set-cookie'][0].split(';')[0];

        console.log('\n--- Step 4: Verify Merged Cart ---');
        const finalRes = await axios.get(`${baseURL}/cart`, {
            headers: { Cookie: customerToken }
        });
        console.log('Merged Cart Items:', finalRes.data.data.items.length);
        console.log('Owner:', finalRes.data.data.customerId ? 'Customer' : 'Guest');

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

testCart();
