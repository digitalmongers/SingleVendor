
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = 'http://localhost:5000/api/v1';

const debug = async () => {
  try {
    const loginRes = await axios.post(`${baseURL}/admin/auth/login`, {
      email: 'digitalsandl1234#2@gmail.com',
      password: 'Digital@123'
    });
    const token = loginRes.data.data.token;

    const catRes = await axios.get(`${baseURL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const categoryId = catRes.data.data[0]?._id;

    const productData = {
      name: 'Debug Product',
      description: 'Debug Description',
      category: categoryId,
      unit: 'pc',
      price: 100,
      sku: `SKU-DEBUG-${Date.now()}`
    };

    const res = await axios.post(`${baseURL}/products`, productData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Success:', res.data);
  } catch (error) {
    if (error.response) {
      console.log('VALIDATION ERROR DETAILS:');
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Error:', error.message);
    }
  }
};

debug();
