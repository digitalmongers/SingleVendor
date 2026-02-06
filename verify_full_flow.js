
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = 'http://localhost:5000/api/v1';

const testFlow = async () => {
  try {
    console.log('🚀 Starting Full Flow Verification...\n');

    // 1. Admin Login
    console.log('--- Step 1: Admin Login ---');
    const adminLoginRes = await axios.post(`${baseURL}/admin/auth/login`, {
      email: 'digitalmongers72@gmail.com',
      password: 'Digital1234#'
    });
    const adminToken = adminLoginRes.data.data.token;
    console.log('✅ Admin Logged In\n');

    // 2 & 3: Ensure Category Exists and Get ID
    console.log('--- Step 2: Ensuring Category exists ---');
    let categoryId;
    try {
      const catRes = await axios.get(`${baseURL}/categories`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (catRes.data.data && catRes.data.data.length > 0) {
        categoryId = catRes.data.data[0]._id;
      } else {
        console.log('  Creating new category...');
        const newCat = await axios.post(`${baseURL}/categories`, { name: 'Electronics' }, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        categoryId = newCat.data.data._id;
      }
    } catch (e) {
      console.log('  Failed to get categories, trying to create one anyway...');
      const newCat = await axios.post(`${baseURL}/categories`, { name: 'Electronics' }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      categoryId = newCat.data.data._id;
    }
    console.log(`✅ Using Category ID: ${categoryId}\n`);

    // 4. Create Product
    console.log('--- Step 3: Admin Creating Product ---');
    const productData = {
      name: `Pro Laptop ${Date.now()}`,
      description: 'Enterprise grade high performance laptop.',
      category: categoryId,
      unit: 'unit',
      price: 1200,
      quantity: 10,
      sku: `LAPTOP-${Date.now()}`,
      status: 'active',
      isActive: true,
      productType: 'physical'
    };
    const productRes = await axios.post(`${baseURL}/products`, productData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const productId = productRes.data.data._id;
    console.log(`✅ Product Created: ${productData.name} (ID: ${productId})\n`);

    // 5. Customer Login
    console.log('--- Step 4: Customer Login ---');
    const custLoginRes = await axios.post(`${baseURL}/customers/login`, {
      email: 'paras@digitalmongers.com',
      password: 'Pa25@ra#$'
    });
    const setCookie = custLoginRes.headers['set-cookie'];
    const custCookie = setCookie ? setCookie[0].split(';')[0] : '';
    console.log('✅ Customer Logged In\n');

    // 6. Add to Cart
    console.log('--- Step 5: Adding Product to Cart ---');
    await axios.post(`${baseURL}/cart/add`, {
      productId,
      quantity: 1
    }, {
      headers: { Cookie: custCookie }
    });
    console.log('✅ Added to Cart successfully\n');

    // 7. Add to Wishlist
    console.log('--- Step 6: Adding Product to Wishlist ---');
    await axios.post(`${baseURL}/wishlist`, {
      productId
    }, {
      headers: { Cookie: custCookie }
    });
    console.log('✅ Added to Wishlist successfully\n');

    // 8. Verification
    console.log('--- Final Step: Verifying Data ---');
    const cartRes = await axios.get(`${baseURL}/cart`, { headers: { Cookie: custCookie } });
    const wishlistRes = await axios.get(`${baseURL}/wishlist`, { headers: { Cookie: custCookie } });

    const isInCart = cartRes.data.data.items.some(i => i.product._id === productId);
    const isInWishlist = wishlistRes.data.data.items.some(i => i.product._id === productId);

    console.log(`🛒 Cart Items Found: ${cartRes.data.data.items.length}`);
    console.log(`❤️ Wishlist Items Found: ${wishlistRes.data.data.items.length}`);

    if (isInCart && isInWishlist) {
      console.log('\n🌟 ALL E2E TESTS PASSED SUCCESSFULLY! 🌟');
    } else {
      console.log('\n❌ Verification Failed: Product mismatch.');
    }

  } catch (error) {
    console.error('❌ Flow Failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
};

testFlow();
