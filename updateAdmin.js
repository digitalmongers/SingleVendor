import mongoose from 'mongoose';
import env from './src/config/env.js';
import Admin from './src/models/admin.model.js';
import connectDB from './src/config/db.js';
import Logger from './src/utils/logger.js';

const updateAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = env.ADMIN_EMAIL;
        const adminPassword = env.ADMIN_PASSWORD;

        // Find the first admin and update
        const admin = await Admin.findOne();

        if (admin) {
            admin.email = adminEmail;
            admin.password = adminPassword; // Model pre-save hook will hash this
            await admin.save();
            console.log(`✅ Admin updated successfully to: ${adminEmail}`);
        } else {
            // If no admin exists, create one
            await Admin.create({
                name: 'System Admin',
                email: adminEmail,
                password: adminPassword
            });
            console.log(`✅ Admin created successfully: ${adminEmail}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update admin:', error);
        process.exit(1);
    }
};

updateAdmin();
