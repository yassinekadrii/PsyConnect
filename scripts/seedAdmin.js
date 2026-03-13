/**
 * @file scripts/seedAdmin.js
 * @description Script to seed initial administrative users into the database.
 * Useful for initializing the platform after a clean database setup.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Admin credentials
const ADMIN_DATA = {
    firstName: 'Admin',
    lastName: 'PsyConnect',
    email: 'admin@psyconnect.com',
    phone: '+33 6 00 00 00 00',
    password: 'password123',
    role: 'admin',
    isSuperAdmin: true,
    isVerified: true
};

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connecté à MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_DATA.email });

        if (existingAdmin) {
            console.log('ℹ️  Un compte admin existe déjà avec cet email');
            console.log('📧 Email:', ADMIN_DATA.email);
            process.exit(0);
        }

        // Create admin user
        const admin = new User(ADMIN_DATA);
        await admin.save();

        console.log('✅ Compte admin créé avec succès!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:', ADMIN_DATA.email);
        console.log('🔑 Mot de passe:', ADMIN_DATA.password);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la création du compte admin:', error);
        process.exit(1);
    }
};

// Run the seed function
seedAdmin();
