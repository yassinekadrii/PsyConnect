/**
 * @file scripts/setupSuperAdmin.js
 * @description Script to configure or elevate a user to Super Admin status.
 * Used for recovery or high-level platform configuration.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const setupSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const admin = await User.findOne({ email: 'admin@psyconnect.com' });

        if (admin) {
            admin.isSuperAdmin = true;
            await admin.save();
            console.log('✅ Admin promu Super Admin avec succès!');
        } else {
            console.log('❌ Admin introuvable.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
};

setupSuperAdmin();
